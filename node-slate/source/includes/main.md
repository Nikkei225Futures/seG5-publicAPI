# Introduction
これは, ソフトウェア工学でのG5-ちらSeatの公開APIドキュメントである.

# Overview
この公開APIでは, APIにアクセスするためにWebsocketを用いる. また, APIはJSON-RPCのメッセージ形式でデータの送受信を行う. この公開APIでは, 主にアカウント登録系, ログイン/ログアウト系, 情報参照系, 情報取得系APIの5種類が提供される.
特に, 情報参照, 情報変更系APIへのアクセスはトークンによる認証を行うため, ログインAPIを1番最初に実行してトークンを手に入れる必要がある.

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

各項目でエラー条件等は記載するが, 共通エラーはCommon errorsに記載する.

# API
公開APIに実装するメソッドとそのメッセージ形式について記述する.
各項目の後のカッコ内が呼び出しメソッド名であり, これ以降はJSON-RPCに共通するフィールドは省き, パラメータ(呼び出し関数の引数)の定義のみを記述する.


# > アカウント登録系API
アカウント登録APIでは, 登録したいアカウントの種類ごとに異なるAPIが使用される. なお, アカウント登録系APIの実行には認証トークンは必要ない.

## 利用者アカウント登録API(register/user)
これは利用者アカウントを登録する際に使用するAPIである. このAPIを実行すると, 引数に含まれるユーザ名とパスワードで利用者アカウントが作成される.
ただし, ユーザ名(user_name)は一意でなければならない.
### 利用者アカウント登録APIでのリクエストメッセージ定義
> 利用者アカウント登録API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "2",
   "method": "register/user",
   "params": {
      "user_name": "IAmTheUser",
      "password": "yourPasswordMustBeString"
   }
}
```
利用者アカウント登録APIへのリクエストメッセージには次のパラメータが含まれていなければならない.

| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| userName | string | ユーザ名 |
| password | string | パスワード |

### 利用者アカウント登録APIでのレスポンスメッセージ
#### 利用者アカウント登録成功時のレスポンスメッセージ定義
> 利用者アカウント登録API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "2",
   "result": {
      "status": "success"
   }
}
```
リクエストが正常に処理され, 成功した場合は次のようなレスポンスが返却される.

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |

#### 利用者アカウント登録失敗時のレスポンスメッセージ定義
> 利用者アカウント登録API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "2",
   "result": {
      "status": "error",
      "reason": "500"
   }
}
```

リクエストの処理に失敗した場合は次のようなレスポンスが返却される.
| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | エラーメッセージ |

また, このメソッドには共通エラーメッセージの他に次のエラーメッセージ(reason)が含まれる場合がある. これは次の表の通りである.
| 失敗理由 | reasonの内容 |
| ----------- | -------- |
| user_nameが他のユーザと重複している | "user_name has already taken by other user" |

## 店舗アカウント登録API(register/restaurant)
### 店舗アカウント登録APIでのリクエストメッセージ定義
これは店舗アカウントを登録する際に使用するAPIである. このAPIを実行すると, 引数に含まれるユーザ名とパスワードで店舗アカウントが作成される.
ただし, ユーザ名(restaurant_name)は一意でなければならない.

> 店舗アカウント登録API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "3",
   "method": "register/restaurant",
   "params": {
      "restaurant_name": "IAmTheRestaurant",
      "password": "myPasswordIsWeak"
   }
}
```
店舗アカウント登録APIへのリクエストメッセージには次のパラメータが含まれていなければならない.

| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| restaurantName | string | 店舗名 |
| password | string | パスワード |


### 店舗アカウント登録成功時のレスポンスメッセージ定義
> 店舗アカウント登録API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "3",
   "result": {
      "status": "success"
   }
}
```
リクエストが正常に処理され, 成功した場合は次のようなレスポンスが返却される.

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |

### 店舗アカウント登録失敗時のレスポンスメッセージ定義
> 店舗アカウント登録API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "3",
   "result": {
      "status": "error",
      "reason": "418"
   }
}
```
リクエストの処理に失敗した場合は次のようなレスポンスが返却される.
| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | エラーメッセージ |

また, このメソッドには共通エラーメッセージの他に次のエラーメッセージ(reason)が含まれる場合がある. これは次の表の通りである.
| 失敗理由 | reasonの内容 |
| ----------- | -------- |
| restaurant_nameが他のユーザと重複している | "restaurant_name has already taken by other user" |

## 管理者アカウント登録API(register/admin)
これは管理者アカウントを登録する際に使用するAPIである. このAPIを実行すると, 引数に含まれるユーザ名とパスワードで管理者アカウントが作成される.
ただし, ユーザ名(admin_name)は一意でなければならない.

### 管理者アカウント登録APIでのリクエストメッセージ定義
これは管理者アカウントを登録する際に使用するAPIである. このAPIを実行すると, 引数に含まれるユーザ名とパスワードで管理者アカウントが作成される.
なお, 管理者アカウントの作成はリクエストにあるadminPasswordを知っている者のみが可能である.
> 店舗アカウント登録API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "4",
   "method": "register/admin",
   "params": {
      "admin_name": "IAmTheAdmin",
      "password": "myPasswordIsWeak",
      "adminPassword": "SECRET"
   }
}
```
管理者アカウント登録APIへのリクエストメッセージには次のパラメータが含まれていなければならない.

| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| adminName | string | 管理者名 |
| password | string | パスワード |
| adminPassword | string | 管理者アカウントを作成するためのパスワード |

### 管理者アカウント登録成功時のレスポンスメッセージ定義
> 管理者アカウント登録API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "4",
   "result": {
      "status": "success"
   }
}
```
リクエストが正常に処理され, 成功した場合は次のようなレスポンスが返却される.

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |

### 管理者アカウント登録失敗時のレスポンスメッセージ定義
> 管理者アカウント登録API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "4",
   "result": {
      "status": "error",
      "reason": "You don't have permission to create admin account. adminPassword is wrong."
   }
}
```
リクエストの処理に失敗した場合は次のようなレスポンスが返却される.
| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | エラーメッセージ |
<br>

このメソッドには共通エラーメッセージの他に次のエラーメッセージ(reason)が含まれる場合がある. これは次の表の通りである.
| 失敗理由 | reasonの内容 |
| ----------- | -------- |
| adminPasswordが間違っている | "You don't have permission to create admin account. adminPassword is wrong." |
| admin_nameが他のユーザと重複している | "admin_name has already taken by other user" |


# > ログイン/ログアウト系API
ログイン/ログアウトAPIでは, クライアントからの要求により, ログイン処理とログアウト処理を行う. なお, ログイン処理では, 各種APIの実行に必要なトークンを発行するため, これを必ずクライアント側で保持しておかなければならない.

## ログインAPI(login)
ログインAPIでは, クライアントからの要求によりサーバ側で認証を行い, 以降に記述する各種APIにアクセスするためのトークンを発行する.
よって, このAPIはクライアントが起動してからサーバに通信を行う時, 一番最初に実行されなければならない.

### ログインAPIでのリクエストメッセージ定義
> ログインAPI-リクエストメッセージの例
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
> ログインAPI-レスポンスメッセージの例(成功時)
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
> ログインAPI-レスポンスメッセージの例(失敗時)
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
また, トークンが見つからない場合, ログアウトAPIはエラーメッセージを返却するが, トークンは一定時間で破棄されるのでクライアント側ではそのままログアウト処理を継続しても構わない.

### ログアウトAPIでのリクエストメッセージ定義
> ログアウトAPI-リクエストメッセージの例
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
> ログアウトAPI-レスポンスメッセージの例(成功時)
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
> ログアウトAPI-レスポンスメッセージの例(失敗時)
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


# > 情報参照系API
情報参照系APIは各アカウントの情報等を取得することができる. 
ただし, 情報参照系APIのリクエストメッセージのパラメータには認証トークンが必須であり, この認証トークンの発行者によってレスポンスメッセージが異なる.

## 利用者アカウント情報取得API
これは利用者アカウント情報を取得するAPIであり, 利用者アカウント基本情報取得APIと利用者予約情報取得API, 利用者食べログ情報取得APIの3種類が提供される.

## > 利用者アカウント基本情報取得API(getInfo/user/basic)
利用者アカウント基本情報取得APIを実行すると, ユーザのアカウント情報が返却される. また, 利用者アカウント基本情報取得APIでは, IDもしくは利用者アカウント名によって検索することが可能である. 
### 利用者アカウント基本情報取得APIでのリクエストメッセージ定義
> 利用者アカウント基本情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "5",
   "method": "getInfo/user/basic",
   "params": {
      "searchBy": "user_id",
      "user_id": "123456789",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
利用者アカウント基本情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| searchBy | string | 検索方法を表す.<br> 利用者アカウントIDによる検索 -> "user_id"<br> 利用者アカウント名による検索 -> "user_name" |
| user_id | string | searchByが"user_id"の場合に必須. 情報を取得したい利用者アカウントのIDを表す. |
| user_name | string | searchByが"user_name"の場合に必須. 情報を取得したい利用者アカウントの名前を表す. |
| token | string | ログイン時に発行されたtoken |

### 利用者アカウント基本情報取得APIでのレスポンスメッセージ定義(成功時)
> 利用者アカウント基本情報取得API-レスポンスメッセージの例(成功時, トークン発行者がユーザ若しくは管理者の場合)
```json
{
   "jsonrpc": "2.0",
   "id": "5",
   "result": {
      "status": "success",
      "user_id": "123456789",
      "user_name": "IAmTheUser",
      "age": "25",
      "gender": "male",
      "email_addr": "example@example.com",
      "address": "高知県香美市土佐山田町宮ノ口185",
      "num_vicious_cancels": "0"
   }
}
```
利用者アカウント基本情報取得APIの実行成功時には次のようなメッセージが返却される.<br>
ただし, 次の表4列目の通り, 店舗アカウントがこのAPIを実行した時にはいくつかの項目が返却されない.

| 返り値 | 型 | 説明 | 含まれる条件 |
| --------- | --- | --- | ---- |
| status | string | "success" | トークン発行者が利用者本人または店舗, 管理者の時 |
| user_id | string | 利用者アカウントのID | トークン発行者が利用者本人または店舗, 管理者の時 |
| user_name | string | 利用者の名前 | トークン発行者が利用者本人または店舗, 管理者の時 |
| age | string | 利用者の年齢 | トークン発行者が利用者本人または店舗, 管理者の時 |
| gender | string | 利用者の性別 | トークン発行者が利用者本人または店舗, 管理者の時 |
| email_addr | string | 利用者のメールアドレス | トークン発行者が利用者本人または管理者の時 |
| address | string | 利用者の住所 | トークン発行者が利用者本人または管理者の時 |
| num_vicious_cancels | string | 利用者の悪質な予約キャンセル数 | トークン発行者が利用者本人または店舗, 管理者の時 |

### 利用者アカウント基本情報取得APIでのレスポンスメッセージ定義(失敗時)
> 利用者アカウント基本情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "5",
   "result": {
      "status": "error",
      "reason": "no user matched"
   }
}
```
利用者アカウント基本情報取得APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 | 含まれる条件 |
| --------- | --- | --- | ---- |
| status | string | "error" | トークン発行者が利用者本人または店舗, 管理者の時 |
| reason | string | 実行が失敗した理由 | トークン発行者が利用者本人または店舗, 管理者の時 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| パラメータsearchByがメッセージに含まれていない | "param.searchBy is not found" |
| パラメータsearchByが不正 | "params.searchBy is invalid. this should be "user_id" or "user_name" " |
| パラメータsearchByが"user_id"であるが, パラメータに"user_id"が含まれていない | "you specified "user_id" in params.searchBy but there are not key("user_id")" |
| パラメータsearchByが"user_name"であるが, パラメータに"user_name"が含まれていない| "you specified "user_name" in params.searchBy but there are not key("user_name")" |
| 利用者アカウントが見つからなかった | "no user matched" |

## > 利用者予約情報取得API(getInfo/user/reservations)
利用者予約情報取得APIを実行すると, ユーザが保持している有効な予約情報の一覧を取得することができる. なお, このAPIは利用者本人もしくは管理者のみしか実行できない. それ以外が実行した場合は403エラーが返却される.
### 利用者予約情報取得APIでのリクエストメッセージ定義
> 利用者予約情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "6",
   "method": "getInfo/user/reservations",
   "params": {
      "user_id": "YouAreTheUser",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
利用者予約情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| user_id | string | 情報を取得したい利用者アカウントのIDを表す. |
| token | string | ログイン時に発行されたtoken |

### 利用者予約情報取得APIでのレスポンスメッセージ定義(成功時)
> 利用者アカウント基本情報取得API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "6",
   "result": {
      "status": "success",
      "reservations":[
         {
            "reservation_id": "5548",
            "restaurant_id": "123456789",
            "user_id": "55795132",
            "seat_id": "7894561230",
            "time_start": "1639494000000",
            "time_end": "1639497600000",
            "num_people": "4",
            "is_expired": false
         },
         {
            "reservation_id": "5678",
            "restaurant_id": "123456789",
            "user_id": "55795132",
            "seat_id": "7894561237",
            "time_start": "1639594000000",
            "time_end": "1639597600000",
            "num_people": "2",
            "is_expired": false
         },
         {
            "reservation_id": "5897",
            "restaurant_id": "1234567114",
            "user_id": "55795132",
            "seat_id": "7894467982",
            "time_start": "1639494000000",
            "time_end": "1639497600000",
            "num_people": "4",
            "is_expired": false
         }
      ]
   }
}
```
利用者予約情報取得APIの実行成功時には次のようなメッセージが返却される.
| 返り値 | 型 | 説明 | 
| --------- | --- | --- | 
| status | string | "success" |
| reservations | JSONObject[] | JSONオブジェクトの配列 |
| > reservation_id | string | 予約ID |
| > restaurant_id | string | 予約したレストランのID |
| > user_id | string | 常に検索したユーザのIDが入る |
| > seat_id | string | 予約した席のID |
| > time_start | string | 予約した開始時間 |
| > time_end | string | 予約した終了時間 |
| > num_people | string | 一緒に行く人数 |
| > is_expired | boolean | 予約が失効しているかどうか, これは常にfalse |

### 利用者予約情報取得APIでのレスポンスメッセージ定義(失敗時)
> 利用者予約情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "6",
   "result": {
      "status": "error",
      "reason": "The user has no reservation"
   }
}
```
利用者予約情報取得APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行が失敗した理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 利用者アカウントが見つからなかった | "no user matched" |
| 利用者アカウントは予約情報を持っていない | "The user has no reservation" |


## > 利用者食べログ情報取得API(getInfo/user/evaluations)
利用者食べログ情報取得APIを実行すると, 利用者が過去に書き込んだ食べログ情報の全てを取得することができる.
なお, このAPIが実行できるのは利用者本人もしくは管理者のみである. それ以外が実行した場合は403エラーが返却される.

### 利用者食べログ情報取得APIでのリクエストメッセージ定義
> 利用者食べログ情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "9",
   "method": "getInfo/user/evaluations",
   "params": {
      "user_id": "654321",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
利用者食べログ情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| user_id | string | 情報を取得したい利用者アカウントのIDを表す. |
| token | string | ログイン時に発行されたtoken |


### 利用者食べログ情報取得APIでのレスポンスメッセージ定義(成功時)
> 利用者食べログ情報取得API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "9",
   "result": {
      "status": "success",
      "evaluations":[
         {
            "reservation_id": "467832",
            "restaurant_id": "346876",
            "user_id": "654321",
            "evaluation_grade": "4",
            "evaluation_comment": "まあまあ美味しかった"
         },
         {
            "reservation_id": "467845",
            "restaurant_id": "422235",
            "user_id": "654321",
            "evaluation_grade": "1",
            "evaluation_comment": "クソまずかった"
         }
      ]
   }
}
```

利用者食べログ情報取得APIの実行成功時には次のようなメッセージが返却される.
| 返り値 | 型 | 説明 | 
| --------- | --- | --- | 
| status | string | "success" |
| evaluations | JSONObject[] | JSONオブジェクトの配列 |
| > evaluation_id | string | 食べログID |
| > restaurant_id | string | 評価したレストランのID |
| > user_id | string | 常に検索したユーザのIDが入る |
| > evaluation_grade | string | 5段階評価, 1-5が入る |
| > evaluation_comment | string | 食べログのコメント |



### 利用者食べログ情報取得APIでのレスポンスメッセージ定義(失敗時)
> 利用者食べログ情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "9",
   "result": {
      "status": "error",
      "reason": "403"
   }
}
```

利用者食べログ情報取得APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行が失敗した理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 利用者アカウントが見つからなかった | "no user matched" |
| 利用者アカウントは食べログ情報を持っていない | "The user has no evaluation" |



## 店舗アカウント情報取得API
店舗アカウント情報取得APIでは, 店舗に関する基本情報, 座席情報, 予約情報, 休日情報を取得するAPIを提供する. また, このAPIはトークンの発行者によって実行結果が変化する.

## > 店舗基本情報取得API(getInfo/restaurant/basic)
店舗基本情報取得APIを実行すると, 店舗に関する基本情報(店舗ID, 店舗名, 住所, メールアドレス, 営業時間, 休日情報)を取得できる. なお, この基本情報はトークン発行者によって実行結果が変化せず, 全てのクライアントから実行可能である.

### 店舗基本情報取得APIでのリクエストメッセージ定義
> 店舗基本情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "10",
   "method": "getInfo/restaurant/basic",
   "params": {
      "searchBy": "restaurant_name",
      "restaurant_name": "abcdefg焼肉店",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
店舗基本情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| searchBy | string | 検索方法を表す.<br> 店舗アカウントIDによる検索 -> "restaurant_id"<br> 店舗名による検索 -> "restaurant_name" |
| restaurant_id | string | searchByが"user_id"の場合に必須. 情報を取得したい利用者アカウントのIDを表す. |
| restaurant_name | string | searchByが"user_name"の場合に必須. 情報を取得したい利用者アカウントの名前を表す. |
| token | string | ログイン時に発行されたtoken |

### 店舗基本情報取得APIでのレスポンスメッセージ定義(成功時)
> 店舗基本情報取得API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "10",
   "result": {
      "status": "success",
      "restaurant_id": "123456789",
      "restaurant_name": "abcdefg焼肉店",
      "email_addr": "example@example.com",
      "address": "高知県香美市土佐山田町xx番地yy",
      "time_open": "10:00",
      "time_close": "23:00",
      "holidays": [
         {
            "holiday": "2021/12/24"
         },
         {
            "holiday": "2021/12/25"
         },
         {
            "holiday": "2022/01/01"
         },
         {
            "holiday": "2022/01/02"
         },
         {
            "holiday": "2022/01/04"
         },
      ]
   }
}
```
店舗情報取得APIの実行成功時には次のようなメッセージが返却される.<br>
ただし, 次の表4列目の通り, 店舗アカウントがこのAPIを実行した時にはいくつかの項目が返却されない.

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |
| restaurant_id | string | 店舗のID | 
| restaurant_name | string | 店舗名 |
| email_addr | string | 店舗のメールアドレス |
| address | string | 店舗の住所 |
| time_open | string | 店舗の始業時間 |
| time_close | string | 店舗の終業時間 |
| holidays | string | JSONObject |
| > holiday | string | 休日の年月日, YYYY/MM/DD形式 |

### 店舗基本情報取得APIでのレスポンスメッセージ定義(失敗時)
> 店舗基本情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "10",
   "result": {
      "status": "error",
      "reason": "no restaurant matched"
   }
}
```
店舗基本情報取得APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 |
| --------- | --- | --- | 
| status | string | "error" | 
| reason | string | 実行が失敗した理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| パラメータsearchByがメッセージに含まれていない | "param.searchBy is not found" |
| パラメータsearchByが不正 | "params.searchBy is invalid. this should be "restaurant_id" or "restaurant_name" " |
| パラメータsearchByが"restaurant_id"であるが, パラメータに"restaurant_id"が含まれていない | "you specified "restaurant_id" in params.searchBy but there are not key("restaurant_id")" |
| パラメータsearchByが"restaurant_name"であるが, パラメータに"restaurant_name"が含まれていない| "you specified "restaurant_name" in params.searchBy but there are not key("restaurant_name")" |
| 店舗アカウントが見つからなかった | "no restaurant matched" |


## > 店舗座席情報取得API(getInfo/restaurant/seats), 予約情報含む
### 店舗座席情報取得APIでのリクエストメッセージ定義
### 店舗座席情報取得APIでのレスポンスメッセージ定義(成功時)
### 店舗座席情報取得APIでのレスポンスメッセージ定義(失敗時)

## > 店舗食べログ情報取得API(getInfo/restaurant/evaluations)
### 店舗食べログ情報取得APIでのリクエストメッセージ定義
### 店舗食べログ情報取得APIでのレスポンスメッセージ定義(成功時)
### 店舗食べログ情報取得APIでのレスポンスメッセージ定義(失敗時)

## > 店舗情報検索API(getInfo/restaurants)
### 店舗情報検索APIでのリクエストメッセージ定義
### 店舗情報検索APIでのレスポンスメッセージ定義(成功時)
### 店舗情報検索APIでのレスポンスメッセージ定義(失敗時)


## 管理者アカウント情報取得API
## > 管理者アカウント基本情報取得API(getInfo/admin/basic)
### 管理者アカウント基本情報取得APIでのリクエストメッセージ定義
### 管理者アカウント基本情報取得APIでのレスポンスメッセージ定義(成功時)
### 管理者アカウント基本情報取得APIでのレスポンスメッセージ定義(失敗時)



# > 情報更新系API
## 利用者アカウント情報更新API
## > 利用者アカウント基本情報更新API(updateInfo/user/basic)
### 利用者アカウント基本情報更新APIでのリクエストメッセージ定義
### 利用者アカウント基本情報更新APIでのレスポンスメッセージ定義(成功時)
### 利用者アカウント基本情報更新APIでのレスポンスメッセージ定義(失敗時)

## > 利用者予約情報登録/削除API(updateInfo/user/reservation)
### 利用者予約情報登録/削除APIでのリクエストメッセージ定義
### 利用者予約情報登録/削除APIでのレスポンスメッセージ定義(成功時)
### 利用者予約情報登録/削除APIでのレスポンスメッセージ定義(失敗時)

## > 利用者食べログ情報更新API(updateInfo/user/evaluations)
### 利用者食べログ情報更新APIでのリクエストメッセージ定義
### 利用者食べログ情報更新APIでのレスポンスメッセージ定義(成功時)
### 利用者食べログ情報更新APIでのレスポンスメッセージ定義(失敗時)

## 店舗アカウント情報更新API
## > 店舗アカウント基本情報更新API(updateInfo/restaurant/basic)
### 店舗アカウント基本情報更新APIでのリクエストメッセージ定義
### 店舗アカウント基本情報更新APIでのレスポンスメッセージ定義(成功時)
### 店舗アカウント基本情報更新APIでのレスポンスメッセージ定義(失敗時)

## > 店舗座席情報更新API(updateInfo/restaurant/seats)
### 店舗座席情報更新APIでのリクエストメッセージ定義
### 店舗座席情報更新APIでのレスポンスメッセージ定義(成功時)
### 店舗座席情報更新APIでのレスポンスメッセージ定義(失敗時)

## > 店舗座席利用状況更新API(updateInfo/restaurant/seatsAvailability)
### 店舗座席利用状況更新APIでのリクエストメッセージ定義
### 店舗座席利用状況更新APIでのレスポンスメッセージ定義(成功時)
### 店舗座席利用状況更新APIでのレスポンスメッセージ定義(失敗時)

## > 店舗予約情報削除API(updateInfo/restaurant/deleteReservations)
### 店舗予約情報削除APIでのリクエストメッセージ定義
### 店舗予約情報削除APIでのレスポンスメッセージ定義(成功時)
### 店舗予約情報削除APIでのレスポンスメッセージ定義(失敗時)

## > 店舗食べログ情報削除API(updateInfo/restaurant/deleteEvaluations)
### 店舗食べログ情報削除APIでのリクエストメッセージ定義
### 店舗食べログ情報削除APIでのレスポンスメッセージ定義(成功時)
### 店舗食べログ情報削除APIでのレスポンスメッセージ定義(失敗時)

## > 店舗休日情報更新API(updateInfo/restaurant/holidays)
### 店舗休日情報更新APIでのリクエストメッセージ定義
### 店舗休日情報更新APIでのレスポンスメッセージ定義(成功時)
### 店舗休日情報更新APIでのレスポンスメッセージ定義(失敗時)

## 管理者アカウント情報更新API
## > 管理者アカウント基本情報更新API(updateInfo/admin/basic)
### 管理者アカウント基本情報更新APIでのリクエストメッセージ定義
### 管理者アカウント基本情報更新APIでのレスポンスメッセージ定義(成功時)
### 管理者アカウント基本情報更新APIでのレスポンスメッセージ定義(失敗時)

# アカウント退会系API
## アカウント退会API(resign)
### アカウント退会APIでのリクエストメッセージ定義
### アカウント退会APIでのレスポンスメッセージ定義(成功時)
### アカウント退会APIでのリクエストメッセージ定義(失敗時)


## アカウント強制退会API(resign/forced)
### アカウント強制退会APIでのリクエストメッセージ定義
### アカウント強制退会APIでのレスポンスメッセージ定義(成功時)
### アカウント強制退会APIでのリクエストメッセージ定義(失敗時)


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
