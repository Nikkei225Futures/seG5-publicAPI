# Common errors
このAPIでは共通エラーとして次のようなメッセージが返却される. 共通エラーでのreasonはHTTPのステータスコードに準拠するように設計しているが, 一部拡張されている.
```bash

```
> 共通エラーメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "987654321",
   "result": {
      "status": "error",
      "reason": "400"
   }
}
```


reason | Meaning
---------- | -------
400 | Bad Request -- サーバが理解できないメッセージ形式である.
401 | Unauthorized -- トークンによる認証が必要なAPIにおいて認証が失敗した.
403 | Forbidden -- 実行が許可されていないメソッドを実行しようとした.
404 | Not Found -- メソッドが存在しない.
418 | I'm a teapot -- pouring coffee with teapot is unacceptable. respect teapot and the humanity.
429 | Too Many Requests -- リクエストが多すぎる.
452 | No token included -- トークンによる認証が必要なAPIにおいてパラメータにトークンが含まれていない
453 | No parameter included -- パラメータが無い
500 | Internal Server Error -- 何等かの理由で処理が実行できなかった.
512 | DB connection failed -- DBへ接続できなかった.

共通エラー以外で各項目に定めるエラー時のreasonには上記以外のレスポンスが含まれる.