# Introduction
これは, ソフトウェア工学でのG5-ちらSeatの公開APIドキュメントである.

# Overview
この公開APIでは, APIにアクセスするためにWebsocketを用いる. また, APIはJSON-RPCのメッセージ形式でデータの送受信を行う.

## JSON-RPC
JSON-RPCとは, 軽量な遠隔手続き呼び出し(RPC)プロトコルである. JSON-RPCでは, クライアント-サーバ間で送受信されるデータ構造とそのルールを定義する.

### 関数を呼び出す(リクエスト)

```bash

```
> リクエストメッセージの例

```json
{
   "jsonrpc": "2.0",
   "id": "12345",
   "method": "login",
   "params": {
      "userName": "IAmTheUser",
      "password": "myPasswordIsPASSWORD",
      "role": "restaurant"
   }
}
```

本APIではリクエスト(ここでは関数呼び出し)は以下のようなフィールドを持つJSONオブジェクトのことを表す.

| フィールド | 型 | 説明 |
| --- | --- | --- |
| jsonrpc | string | JSON-RPCの仕様のバージョン, このフィールドは常に"2.0" |
| id | int or string | リクエストの識別子. 応答には同じidが返却される. |
| method | string | 呼び出される関数名(メソッド名) |
| params | object | 呼び出される関数への引数 |



### レスポンスメッセージ

```bash

```
> レスポンスメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "12345",
   "result": {
      "status": "error",
      "reason": "no such user exist"
   }
}
```

本APIでは常に次のようなフィールドを持つJSONオブジェクトを用いてリクエストに対して応答を行う.

| フィールド | 型 | 説明 |
| --- | --- | --- |
| jsonrpc | string | JSON-RPCの仕様のバージョン, このフィールドは常に"2.0" |
| id | int | リクエストで送信されたものと同じid |
| result | object | 実行結果 |
| > status | string | 実行結果の状態を表す. <br>実行が成功した -> "success", 実行中にエラーが生じた -> "error" |
| params | object | 呼び出される関数への引数 |

# API
公開APIに実装するメソッドとそのメッセージ形式について記述する.
各項目の後のカッコ内が呼び出しメソッド名であり, これ以降はJSON-RPCに共通するフィールドは省き, パラメータ(呼び出し関数の引数)の定義のみを記述する.

# ログイン/ログアウト系API
ログイン/ログアウトAPIでは, クライアントからの要求により, ログイン処理とログアウト処理を行う. なお, ログイン処理では, 各種APIの実行に必要なトークンを発行するため, これを必ずクライアント側で保持しておかなければならない.

## ログインAPI(login)
ログインAPIでは, クライアントからの要求によりサーバ側で認証を行い, 以降に記述する各種APIにアクセスするためのトークンを発行する.
よって, このAPIはクライアントが起動してからサーバに通信を行う時, 一番最初に実行されなければならない.

### ログインAPIでのリクエストメッセージ定義
> リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "1",
   "method": "login",
   "params": {
      "userName": "IAmTheUser",
      "password": "myPasswordIsPASSWORD",
      "role": "user"
   }
}
```
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| userName | string | ユーザ名 |
| password | string | パスワード |
| role | string | 各クライアントが利用者, 店舗もしくは管理者かを表す. <br> 利用者: "user", 店舗: "restaurant", 管理者: "admin" のいずれかである必要がある. |

### ログインAPIでのレスポンスメッセージ定義
#### ログイン(認証)成功時のレスポンスメッセージ定義
> レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "1",
   "result": {
      "status": "success",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "issuerRole": "user",
      "expire": "1639406450754"
   }
}
```
| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |
| token | string(UUID) | 各種APIへアクセスするためのトークン. |
| issuerRole | string | 各クライアントが利用者, 店舗もしくは管理者かを表す. <br> 利用者: "user", 店舗: "restaurant", 管理者: "admin" のいずれかである. |
| expire | int or string | 発行したトークンが失効する時間(UNIX timestamp形式, ミリ秒単位) |

#### ログイン(認証)失敗時のレスポンスメッセージ定義
> レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "1",
   "result": {
      "status": "error",
      "reason": "no such user exists"
   }
}
```
| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 認証に失敗した理由を表す(後述). |

認証失敗時には, 次のようなメッセージを返却する.<br>
| 認証失敗理由 | メッセージ内容 |
| ----------- | -------- |
| DBにユーザ名が存在しない | no such user exists |
| パスワードが間違っている | wrong password |
| パラメータroleが間違っている | invalid parameter(params.role at login request) |


## ログアウトAPI(logout)
ログアウトAPIでは, クライアントからの要求によりログアウト処理を行う. ログアウト処理では, 発行したトークンを即時に破棄する.

### ログアウトAPIでのリクエストメッセージ定義
> リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "1",
   "method": "logout",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |

### ログアウトAPIでのレスポンスメッセージ定義
#### ログアウト成功時のレスポンスメッセージ定義
> レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "1",
   "result": {
      "status": "success",
   }
}
```

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |

#### ログアウト失敗時のレスポンスメッセージ定義
> レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "1",
   "result": {
      "status": "error",
      "reason": "invalid token"
   }
}
```
| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | "invalid token", ログアウト失敗理由は無効なトークンが送られた場合のみである. |






# 以下サンプル, 書き終わったら消します







# Authentication

> To authorize, use this code:

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
```

```bash
# With shell, you can just pass the correct header with each request
curl "api_endpoint_here"
  -H "Authorization: meowmeowmeow"
```

```javascript
import { kittn } from 'kittn';

const api = kittn.authorize('meowmeowmeow');
```

> Make sure to replace `meowmeowmeow` with your API key.

Kittn uses API keys to allow access to the API. You can register a new Kittn API key at our [developer portal](https://example.com/developers).

Kittn expects for the API key to be included in all API requests to the server in a header that looks like the following:

`Authorization: meowmeowmeow`

<aside class=notice>
You must replace <code>meowmeowmeow</code> with your personal API key.
</aside>

# Kittens

## Get All Kittens

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
api.kittens.get
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
api.kittens.get()
```

```bash
curl "https://example.com/api/kittens"
  -H "Authorization: meowmeowmeow"
```

```javascript
import { kittn } from 'kittn';

const api = kittn.authorize('meowmeowmeow');
const kittens = api.kittens.get();
```

> The above command returns JSON structured like this:

```json
[
   {
      "id":         1,
      "name":       "Fluffums",
      "breed":      "calico",
      "fluffiness": 6,
      "cuteness":   7
   },
   {
      "id":         2,
      "name":       "Max",
      "breed":      "unknown",
      "fluffiness": 5,
      "cuteness":   10
   }
]
```

This endpoint retrieves all kittens.

### HTTP Request

`GET https://example.com/api/kittens`

### Query Parameters

Parameter | Default | Description
--------- | ------- | -----------
include_cats | false | If set to true, the result will also include cats.
available | true | If set to false, the result will include kittens that have already been adopted.

<aside class=success>
Remember — a happy kitten is an authenticated kitten!
</aside>

## Get a Specific Kitten

```ruby
require 'kittn'

api = Kittn::APIClient.authorize!('meowmeowmeow')
api.kittens.get(2)
```

```python
import kittn

api = kittn.authorize('meowmeowmeow')
api.kittens.get(2)
```

```bash
curl "https://example.com/api/kittens/2"
  -H "Authorization: meowmeowmeow"
```

```javascript
import { kittn } from 'kittn';

const api = kittn.authorize('meowmeowmeow');
const max = api.kittens.get(2);
```

> The above command returns JSON structured like this:

```json
{
   "id":         2,
   "name":       "Max",
   "breed":      "unknown",
   "fluffiness": 5,
   "cuteness":   10
}
```

This endpoint retrieves a specific kitten.

<aside class=warning>
Inside HTML code blocks like this one, you can't use Markdown, so use <code>&lt;code&gt;</code> blocks to denote code.
</aside>

### HTTP Request (with ID)

`GET https://example.com/kittens/<ID>`

### URL Parameters

Parameter | Description
--------- | -----------
ID | The ID of the kitten to retrieve
