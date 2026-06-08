
程序代码中，怎么区分status和state？ [https://www.zhihu.com/question/21994784](https://www.zhihu.com/question/21994784)

在程序代码中似乎很好区分：因为状态机（state machine）、状态迁移图（state transition diagram）都是明确的 state，所以如果「状态」的有效值之间可以搞出类似状态迁移图之类的东西，就命名为 state；否则就用 status。  
比如 TCP 状态之间是有迁移关系的，所以是 TCP state；HTTP 状态码由于没有互相迁移的关系，所以是 HTTP status code。  
ajax 中的 readyState 是 0 UNSENT / 1 OPENED / 2 HEADERS_RECEIVED / 3 LOADING / 4 DONE，表示状态有严格迁移关系的；status 定义自 HTTP Status Code 是表示结果的状态，已经固定不会变动的。