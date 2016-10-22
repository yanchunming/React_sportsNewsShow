"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// 注意方法的传递与调用，父组件的方法当做子组件的属性传递到子组件，如果不是用ES6的写法，方法在子组件中执行时
// 作用域仍旧在父组件，若使用ES6写法，则作用域不是父组件，回调函数都会失去作用域需要用bind重新设定作用域。
// 父组件的方法可以直接在元素上用作回调函数绑定，也可以在子组件的方法中调用，在后者能够将子组件作用域中的数据作为参数传递
// 若不需要子组件的数据则可以直接在元素上调用。
// 注意箭头函数的作用域
var render = ReactDOM.render;
var Component = React.Component;
var Header = (function (_super) {
    __extends(Header, _super);
    function Header() {
        _super.apply(this, arguments);
    }
    Header.prototype.render = function () {
        return (React.createElement("header", {className: "header"}, 
            React.createElement("div", {className: "arrow-container", onClick: this.props.goBack}, 
                React.createElement("span", {className: "arrow"}, 
                    React.createElement("span", {className: "arrow blue"})
                )
            ), 
            React.createElement("span", {className: "login"}, "登录"), 
            React.createElement("h1", null, "体育新闻")));
    };
    return Header;
}(Component));
var List = (function (_super) {
    __extends(List, _super);
    function List() {
        _super.apply(this, arguments);
    }
    // 事件回调函数
    List.prototype.chooseNews = function (id, e) {
        console.log(e.target);
        console.log(this);
        console.log(arguments);
        var id = id;
        this.props.getDetailData(id);
    };
    // 注意下面事件回调函数中绑定作用域与传递参数的方式
    List.prototype.createList = function () {
        var _this = this;
        return this.props.data.map(function (obj, index) {
            return (React.createElement("li", {"data-id": obj.id, key: index, onClick: _this.chooseNews.bind(_this, obj.id)}, 
                React.createElement("img", {src: obj.img, alt: ""}), 
                React.createElement("div", null, 
                    React.createElement("h3", null, obj.title), 
                    React.createElement("p", null, 
                        obj.content, 
                        " ", 
                        React.createElement("span", {className: "list-comment"}, 
                            "评论：", 
                            obj.comment)))));
        });
    };
    List.prototype.render = function () {
        return (React.createElement("ul", {className: "list"}, this.createList()));
    };
    return List;
}(Component));
var Detail = (function (_super) {
    __extends(Detail, _super);
    function Detail() {
        _super.apply(this, arguments);
    }
    Detail.prototype.showMoreComment = function (e) {
        console.log(e);
        console.log(e.currentTarget);
        var id = e.currentTarget.getAttribute("data-id");
        this.props.getMoreComment(id);
    };
    Detail.prototype.render = function () {
        var data = this.props.data;
        var content = {
            __html: data.content
        };
        // 注意dangerouslySetInnerHTML属性的使用方法
        return (React.createElement("div", {className: "detail"}, 
            React.createElement("h1", null, data.title), 
            React.createElement("p", {className: "intro"}, 
                React.createElement("span", {className: "detail-time"}, data.time), 
                React.createElement("span", {className: "detail-comment"}, 
                    "评论：", 
                    data.comment)), 
            React.createElement("img", {src: data.img, alt: ""}), 
            React.createElement("p", {className: "detail-content", dangerouslySetInnerHTML: content}), 
            React.createElement("span", {className: "detail-comment-btn", "data-id": data.id, onClick: this.showMoreComment.bind(this)}, "查看更多评论")));
    };
    return Detail;
}(Component));
var Comment = (function (_super) {
    __extends(Comment, _super);
    // 注意这种定义初始状态和默认属性的方式
    function Comment(props) {
        _super.call(this, props);
        this.state = {
            data: props.data
        };
    }
    Comment.prototype.createList = function () {
        var list = this.state.data.list;
        return list.map(function (obj, index) {
            return (React.createElement("li", {key: index}, 
                React.createElement("h3", null, obj.user), 
                React.createElement("p", null, obj.content), 
                React.createElement("span", null, obj.time)));
        });
    };
    // 注意ref属性的使用方法
    Comment.prototype.commentPublish = function () {
        var value = this.refs.commentTextarea.value;
        if (value === "") {
            alert("发布内容不能为空！");
            return;
        }
        ;
        this.submitData(value);
    };
    // 自定义方法
    Comment.prototype.submitData = function (val) {
        var _this = this;
        var date = new Date();
        var listData = this.state.data;
        var data = {
            user: "xixihaha",
            content: val,
            time: "刚刚" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
        };
        var url = "data/addComment.json" + Util.objectToQuery(data);
        Util.ajax(url, function (res) {
            console.log(_this);
            if (res && res.errno === 0) {
                listData.list.push(data);
                _this.setState({
                    data: listData
                });
                _this.refs.commentTextarea.value = "";
                alert("发布成功");
            }
            ;
        });
    };
    // 注意当状态值是由属性传递过来时，当父组件传递的属性发生变化时，子组件属性发生变化，已经处在存在期，此时状态不会随之发生变化，数据不会更新，
    // 所以要手动自己在存在期的接收新属性时期进行更新，只有setState,才能更新数据
    Comment.prototype.componentWillReceiveProps = function (newprops) {
        this.setState({
            data: newprops.data
        });
    };
    Comment.prototype.render = function () {
        return (React.createElement("div", {className: "comment"}, 
            React.createElement("div", {className: "input-container"}, 
                React.createElement("textarea", {ref: "commentTextarea", placeholder: "文明上网，理性发言"}), 
                React.createElement("span", {className: "comment-btn", onClick: this.commentPublish.bind(this)}, "发布")), 
            React.createElement("ul", null, this.createList())));
    };
    return Comment;
}(Component));
var Util = {
    ajax: function (url, fn) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    fn && fn(res);
                }
                ;
            }
            ;
        };
        xhr.open("GET", url, true);
        xhr.send(null);
    },
    objectToQuery: function (obj) {
        var result = "";
        for (var k in obj) {
            result += "&" + k + "=" + obj[k];
        }
        result = "?" + result.slice(1);
        return result;
    }
};
var App = (function (_super) {
    __extends(App, _super);
    function App(props) {
        this.state = {
            section: "list",
            listData: [],
            detailData: {},
            commentData: {
                list: []
            }
        };
        // 注意定义组件的自定义属性
        this.scrolltops = {
            list: 0,
            detail: 0,
            comment: 0
        };
    }
    App.prototype.goBack = function (e) {
        console.log(e);
        var section = this.state.section;
        switch (section) {
            case "list":
                break;
            case "detail":
                this.setState({
                    section: "list"
                });
                // window.scrollTo(0, this.scrollPos.list);
                break;
            case "comment":
                this.setState({
                    section: "detail"
                });
                // window.scrollTo(0, this.scrollPos.detail);
                break;
        }
    };
    // 传递给子组件的方法
    App.prototype.getDetailData = function (id) {
        var _this = this;
        Util.ajax("data/detail.json?id=" + id, function (res) {
            console.log(_this);
            if (res.errno === 0) {
                _this.setState({
                    detailData: res.data,
                    section: "detail"
                });
                // 注意这个步骤在componentDidUpdate 之后
                console.log(111);
                window.scrollTo(0, 0);
            }
            ;
        });
    };
    App.prototype.getMoreComment = function (id) {
        var _this = this;
        Util.ajax("data/comment.json?id=" + id, function (res) {
            console.log(_this);
            if (res.errno === 0) {
                _this.setState({
                    commentData: res.data,
                    section: "comment"
                });
                window.scrollTo(0, 0);
            }
            ;
        });
    };
    App.prototype.componentDidMount = function () {
        var _this = this;
        Util.ajax("data/list.json", function (res) {
            if (res.errno === 0) {
                _this.setState({
                    listData: res.data
                });
            }
            ;
        });
    };
    App.prototype.render = function () {
        console.log(this.props);
        console.log(this.state);
        var section = this.state.section;
        return (React.createElement("div", null, 
            React.createElement(Header, {goBack: this.goBack.bind(this)}), 
            React.createElement("section", {className: "list", style: { display: section === "list" ? "block" : "none" }}, 
                React.createElement(List, {getDetailData: this.getDetailData.bind(this), data: this.state.listData})
            ), 
            React.createElement("section", {className: "detail", style: { display: section === "detail" ? "block" : "none" }}, 
                React.createElement(Detail, {getMoreComment: this.getMoreComment.bind(this), data: this.state.detailData})
            ), 
            React.createElement("section", {className: "comment", style: { display: section === "comment" ? "block" : "none" }}, 
                React.createElement(Comment, {data: this.state.commentData})
            )));
    };
    App.prototype.componentDidUpdate = function (oldprops, oldstate) {
        console.log(222);
        // 巧妙的设置，前进时必然会在此之后执行setState方法之后的scrollTo(0,0);
        // 回退更新时则没有这一步，所以前进总在顶端，回退就不是了
        var num = window.scrollY;
        this.scrolltops[oldstate.section] = window.scrollY;
        window.scrollTo(0, this.scrolltops[this.state.section]);
        console.log(num);
        console.log(window.scrollY);
        console.log(oldstate.section);
        console.log(this.scrolltops);
    };
    return App;
}(Component));
render(React.createElement(App, null), document.getElementById("app"));
