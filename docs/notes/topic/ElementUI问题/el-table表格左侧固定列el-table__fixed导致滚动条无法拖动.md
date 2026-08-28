# el-table表格左侧固定列el-table__fixed导致滚动条无法拖动

## 背景

在表格左侧固定几列，表格无数据时，点击左侧滚动条失效。原因是`el-table__fixed`过高导致的

![image-20240716165434009](el-table表格左侧固定列el-table__fixed导致滚动条无法拖动/image-20240716165434009.png)



## 解决

在对应页面中添加以下样式，即可解决

```css
/* 设置默认高度-滚动条高度 */
::v-deep .el-table__fixed {
  height: calc(100% - 15px) !important;
}
/* 用于消除固定列下方的伪元素边框线 */
::v-deep .el-table__fixed:before {
  height: 0px;
}
```



## 参考链接

https://blog.csdn.net/sunshineTing2/article/details/137350736