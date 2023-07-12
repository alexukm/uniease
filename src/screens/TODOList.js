// 乘客--------------------------------------------------------
//todo 1. 订单列表页  频发读取orders的内容  加载/渲染慢
/*使用了useCallback钩子来定义的函数：openSheet、handleRefresh 和 fetchMoreOrders。
useCallback 是 React 提供的一个 Hook，它会返回一个记忆版本的回调函数，该函数仅在其依赖项发生改变时才会更新。
这些函数在组件重新渲染时不会改变，除非它们的依赖项（例如 loading 和 page）发生变化。这有助于优化性能，因为它避免了不必要的函数创建。

renderItem 函数也被封装在 useCallback 钩子中。
因为 renderItem 函数在组件每次渲染时都会重新创建，这可能会引起不必要的渲染。
使用 useCallback 可以避免这种情况。

从handleRefresh 和 fetchMoreOrders 函数中，将对 setOrders 和 setPage 的调用移到 then 语句的后面。
这意味着状态更新将在异步操作完成后进行，这会减少不必要的重新渲染。*/

//todo 2. 每次进入订单列表 都需要刷新页面  目前是如果之前加载了一次就不刷新了
/*const OrderListScreen = ({navigation}) => {
    // ...

    useFocusEffect(
        React.useCallback(() => {
            handleRefresh();
        }, [])
    );

    // ...
};
每当OrderListScreen获得焦点时，都会触发handleRefresh函数。
也就是说，每当用户导航到这个页面时，都会触发一个数据刷新。
需要注意的是，假设handleRefresh没有依赖项，因此我传入了一个空数组([])作为依赖项列表。
 */

//todo 3. cancel order之后需要刷新当前页  和第二个一样
/*在handleConfirmCancel函数中调用handleRefresh函数.
    当取消订单成功后执行handleRefresh函数*/

//todo 4. 用户评价功能
//做完


//todo 5. 订单详情页中  订单状态图标 更换其他的 目前用的钱包的图标
//Done

// 司机--------------------------------------------------------
//todo 6. 订单广场 改为类似乘客订单列表的 卡片样
//Done

//todo 7. 司机的主页
//Done

//todo 8. 司机 订单列表页
//Done 接口没改
//todo 9. 司机 订单详情页
//Done 接口没改
//todo 10. 订单广场  卡片样式   价格  用预期收益字段
//Done
//todo 11. 订单广场  卡片  地图 可以点击 跳转本机地图
//Done
//todo 12. 订单广场  司机接受订单后刷新当前页面
//Done
//todo 13. 订单广场  websocket 更新订单  不能展示订单内容问题
//Done

//todo 14. 司机订单详情页 样式改动
//改动部分，还需再调整
//todo 15. 乘客订单接受通知
//库有问题，再写
//todo 16. 聊天页面（司机，乘客） 信息存储方案 信息定时删除
//Done

//todo 17. 司机订单详情里面的 payment RBsheet有问题，需要接口
//需要司机payment接口核对

//todo 18. 司机乘客聊天 待定
//todo 19.  获取用户手机号/聊天所需用户code
// todo 20. 删除聊天窗口  (定时删除  滑动窗口删除)
//Done
// todo 21.  整合用户登录 跳转等页面
//Done


// todo 22. 乘客订单页面，需要把cancel 放进details里面
//Done

// todo 23. Details里面需要接口接入司机的对话框
//Done

// todo 29. 乘客地图 去掉推荐地址 地图移动到当前位置
//Done
// todo 30. 新增司机接口  校验司机是否需要补充额外信息

//todo 24. 用户退出  测试
//todo 25. 用户本地聊天信息加载  用户端也需要  目前只有司机页面操作了
//todo 26. 清理本地不需要的日志和代码 删除无用的导包
//Done
//todo 27. 日志框架
//todo 28  司机信息补充页
//Done

//todo 31 司机接单页面，定时刷新，下滑刷新
//todo 32 乘客 下滑不能刷新
//Done

//todo 33 乘客订单详情取消订单之后，Property 'orderStatus' doesn't exist
//todo 34 司机接单，u过订单被接就要消失在订单列表；现在的问题是别人接了，成功失败，其他司机都不能接了。如果接单失败，用户的订单依然没有被接，但是其他司机不能接了。
//Done

//todo 35. 替换 react-native-picker/picker

//todo 36. 司机乘客电话接口

// 后续内容------------------------------------
// 司机接口
// 如果支付相关内容有进展 优先接入支付内容 然后梳理乘客和司机支付相关的内容
// 如果支付无法推进 则对接乘客和司机聊天内容
