// 编译less
fis.match('**.less', {
	// 插件
	parser: 'less',
	// 后缀名
	rExt: '.css'
});

// 编译tsx文件
fis.match('**.tsx', {
	// 插件
	parser: 'typescript',
	// 后缀名
	rExt: '.js'
})