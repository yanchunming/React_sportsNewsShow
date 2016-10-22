// 注意方法的传递与调用，父组件的方法当做子组件的属性传递到子组件，如果不是用ES6的写法，方法在子组件中执行时
// 作用域仍旧在父组件，若使用ES6写法，则作用域不是父组件，回调函数都会失去作用域需要用bind重新设定作用域。
// 父组件的方法可以直接在元素上用作回调函数绑定，也可以在子组件的方法中调用，在后者能够将子组件作用域中的数据作为参数传递
// 若不需要子组件的数据则可以直接在元素上调用。
// 注意箭头函数的作用域
const {render} = ReactDOM;
const {Component} = React;

class Header extends Component {
	render () {
		return (
			<header className="header">
				<div className="arrow-container" onClick={this.props.goBack}>
					<span className="arrow">
						<span className="arrow blue"></span>
					</span>
				</div>
				<span className="login">登录</span>
				<h1>体育新闻</h1>
			</header>
		)
	}
}

class List extends Component {
	// 事件回调函数
	chooseNews (id, e) {
		console.log(e.target);
		console.log(this);
		console.log(arguments);
		let id = id;
		this.props.getDetailData(id);
	}
	// 注意下面事件回调函数中绑定作用域与传递参数的方式
	createList () {
		return this.props.data.map((obj, index) => {
			return (
				<li data-id={obj.id} key={index} onClick={this.chooseNews.bind(this, obj.id)}>
					<img src={obj.img} alt=""/>
					<div>
						<h3>{obj.title}</h3>
						<p>{obj.content} <span className="list-comment">评论：{obj.comment}</span></p>
					</div>
				</li>
			)
		})
	}
	render () {
		return (
			<ul className="list">
				{this.createList()}
			</ul>
		)
	}
}

class Detail extends Component {
	showMoreComment (e) {
		console.log(e);
		console.log(e.currentTarget);
		let id = e.currentTarget.getAttribute("data-id");
		this.props.getMoreComment(id);
	}
	render () {
		let data = this.props.data;
		let content = {
			__html: data.content
		}
		// 注意dangerouslySetInnerHTML属性的使用方法
		return (
			<div className="detail">
				<h1>{data.title}</h1>
				<p className="intro">
					<span className="detail-time">{data.time}</span>
					<span className="detail-comment">评论：{data.comment}</span>
				</p>
				<img src={data.img} alt=""/>
				<p className="detail-content" dangerouslySetInnerHTML={content}></p>
				<span className="detail-comment-btn" data-id={data.id} onClick={this.showMoreComment.bind(this)}>查看更多评论</span>
			</div>
		)
	}
}

class Comment extends Component {
	// 注意这种定义初始状态和默认属性的方式
	constructor (props) {
		super(props);
		this.state = {
			data: props.data
		}
	}
	createList () {
		let list = this.state.data.list
		return list.map((obj, index) => {
			return (
				<li key={index}>
					<h3>{obj.user}</h3>
					<p>{obj.content}</p>
					<span>{obj.time}</span>
				</li>
			)
		})
	}
	// 注意ref属性的使用方法
	commentPublish () {
		let value = this.refs.commentTextarea.value;
		if (value === "") {
			alert("发布内容不能为空！");
			return
		};
		this.submitData(value);
	}
	// 自定义方法
	submitData (val) {
		let date = new Date();
		let listData = this.state.data;
		let data = {
			user: "xixihaha",
			content: val,
			time: "刚刚" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
		}
		let url = "data/addComment.json" + Util.objectToQuery(data);
		Util.ajax(url, res => {
			console.log(this);
			if (res && res.errno === 0) {
				listData.list.push(data);
				this.setState({
					data: listData
				})
				this.refs.commentTextarea.value = "";
				alert("发布成功")
			};
		})

	}
	// 注意当状态值是由属性传递过来时，当父组件传递的属性发生变化时，子组件属性发生变化，已经处在存在期，此时状态不会随之发生变化，数据不会更新，
	// 所以要手动自己在存在期的接收新属性时期进行更新，只有setState,才能更新数据
	componentWillReceiveProps (newprops) {
		this.setState({
			data: newprops.data
		})
	}
	render () {
		return (
			<div className="comment">
				<div className="input-container">
					<textarea ref="commentTextarea" placeholder="文明上网，理性发言"></textarea>
					<span className="comment-btn" onClick={this.commentPublish.bind(this)}>发布</span>
				</div>
				<ul>
					{this.createList()}
				</ul>

			</div>
		)
	}
}

let Util = {
	ajax (url, fn) {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					let res = JSON.parse(xhr.responseText);
					fn && fn(res);
				};
			};
		}
		xhr.open("GET", url, true);
		xhr.send(null);
	},
	objectToQuery (obj) {
		let result = "";
		for(var k in obj) {
			result += "&" + k + "=" + obj[k];
		}
		result = "?" + result.slice(1);
		return result;
	}
}
class App extends Component {
	constructor (props) {
		this.state = {
			section: "list",
			listData: [],
			detailData: {},
			commentData: {
				list: []
			}
		}

		// 注意定义组件的自定义属性
		this.scrolltops = {
			list: 0,
			detail: 0,
			comment: 0
		}
	}
	goBack (e) {
		console.log(e);
		let section = this.state.section;
		switch (section) {
			case "list":
				break;
			case "detail":
				this.setState({
					section: "list"
				})
				// window.scrollTo(0, this.scrollPos.list);
				break;
			case "comment":
				this.setState({
					section: "detail"
				})
				// window.scrollTo(0, this.scrollPos.detail);
				break;
		}
	}
	// 传递给子组件的方法
	getDetailData (id) {
		Util.ajax("data/detail.json?id=" + id, res => {
			console.log(this);
			if (res.errno === 0) {
				this.setState({
					detailData: res.data,
					section: "detail"
				})
				// 注意这个步骤在componentDidUpdate 之后
				console.log(111);
				window.scrollTo(0, 0);
			};
		})
	}
	getMoreComment (id) {
		Util.ajax("data/comment.json?id=" + id, res => {
			console.log(this);
			if (res.errno === 0) {
				this.setState({
					commentData: res.data,
					section: "comment"
				})
				window.scrollTo(0, 0);
			};
		})
	}
	componentDidMount () {
		Util.ajax("data/list.json", res => {
			if (res.errno === 0) {
				this.setState({
					listData: res.data
				})
			};
		})
	}
	render () {
		console.log(this.props);
		console.log(this.state);

		let section = this.state.section;
		return (
			<div>
				<Header goBack={this.goBack.bind(this)}/>
				<section className="list" style={{display: section === "list" ? "block" : "none"}}>
					<List getDetailData={this.getDetailData.bind(this)} data={this.state.listData}/>
				</section>
				<section className="detail" style={{display: section === "detail" ? "block" : "none"}}>
					<Detail getMoreComment={this.getMoreComment.bind(this)} data={this.state.detailData}/>
				</section>
				<section className="comment" style={{display: section === "comment" ? "block" : "none"}}>
					<Comment data={this.state.commentData}/>
				</section>
			</div>
		)
	}
	componentDidUpdate (oldprops, oldstate) {
		console.log(222);
		// 巧妙的设置，前进时必然会在此之后执行setState方法之后的scrollTo(0,0);
		// 回退更新时则没有这一步，所以前进总在顶端，回退就不是了
		var num = window.scrollY;
		this.scrolltops[oldstate.section] = window.scrollY;
		window.scrollTo(0, this.scrolltops[this.state.section]);
		console.log(num);
		console.log(window.scrollY);
		console.log(oldstate.section)
		console.log(this.scrolltops);
	}
}

render(<App />, document.getElementById("app"));