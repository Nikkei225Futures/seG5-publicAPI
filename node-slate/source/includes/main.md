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
| id | int | リクエストで送信されたものと同じid. <br> ただし, リクエストにIDが含まれていなかった場合, -1が返却される. 含まれていなかった場合でも処理は実行される. |
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
      "birthday": "2000/01/01",
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
| birthday | string | 利用者の誕生日, YYYY/MM/DD形式 | トークン発行者が利用者本人または店舗, 管理者の時 |
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
      "user_id": "12345697895",
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
| reservations | JSONArray | JSONオブジェクトの配列 |
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
| evaluations | JSONArray | JSONオブジェクトの配列 |
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

### 店舗アカウント基本情報取得APIでのレスポンスメッセージ定義(成功時)
> 店舗アカウント基本情報取得API-レスポンスメッセージの例(成功時)
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
      "features": "焼肉 ドリンクバー",
      "holidays": ["2021/12/24", "2021/12/25", "2022/01/01", "2022/0102"]
   }
}
```

店舗アカウント情報取得APIの実行成功時には次のようなメッセージが返却される.<br>

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |
| restaurant_id | string | 店舗のID | 
| restaurant_name | string | 店舗名 |
| email_addr | string | 店舗のメールアドレス |
| address | string | 店舗の住所 |
| 店舗me_open | string | 店舗の始業時間 |
| time_close | string | 店舗の終業時間 |
| features | string | 特徴キーワード |
| holidays | string[] | 休日の年月日, YYYY/MM/DD形式 |

### 店舗アカウント基本情報取得APIでのレスポンスメッセージ定義(失敗時)
> 店舗アカウント基本情報取得API-レスポンスメッセージの例(失敗時)
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
店舗アカウント基本情報取得APIの実行失敗時には次のようなメッセージが返却される

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


## > 店舗座席情報取得API(getInfo/restaurant/seats)
店舗座席情報取得APIでは, 店舗の座席情報(座席に座れる人数, 座席の予約情報, 座席の特徴など)を提供する.
### 店舗座席情報取得APIでのリクエストメッセージ定義
> 店舗座席情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "getInfo/restaurant/seats",
   "params": {
      "restaurant_id": "123234",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
店舗座席情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| restaurant_id | string | 情報を取得したい店舗アカウントのIDを表す. |
| token | string | ログイン時に発行されたtoken |


### 店舗座席情報取得APIでのレスポンスメッセージ定義(成功時)
> 店舗座席情報取得API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "15",
   "result": {
      "status": "success",
      "seats": [
         {
            "seat_id": "12398345",
            "seat_name": "1番卓",
            "restaurant_id": "023848345",
            "capacity": "5",
            "is_filled": true,
            "time_start": "17:30:00",
            "staying_times": ["00:15:00", "00:20:00", "01:00:00", "05:00:00"],
            "avg_staying_time": "02:00:00",
            "feauture": "窓際",
            "reservations":[
               {
                  "reservation_id": "2349834",
                  "user_id": "2985345",
                  "time_start": "2021/12/25-12:00:00",
                  "time_end": "2021/12/25-13:00:00"
               },
               {
                  "reservation_id": "2349834",
                  "user_id": "2985345",
                  "time_start": "2021/12/25-16:00:00",
                  "time_end": "2021/12/25-19:00:00"
               }
            ]
         },
         {
            "seat_id": "12398346",
            "seat_name": "2番卓",
            "restaurant_id": "023848345",
            "capacity": "1",
            "is_filled": true,
            "time_start": "17:30:00",
            "staying_times": ["00:15:00", "00:20:00", "01:00:00", "05:00:00"],
            "avg_staying_time": "02:00:00",
            "feauture": "カウンター席",
            "reservations": []   //予約なし空の配列
         }
      ]
   }
}
```

店舗座席情報取得API実行成功時には次のようなメッセージが返却される.

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" | 
| seats | JSONOArray | 座席情報の配列 | 
| > seat_id | string | 座席ID |
| > seat_name | string | 座席名 |
| > restaurant_id | string | 店舗ID | 
| > capacity | string | 席に座れる人数 | 
| > is_filled | boolean | 席が現在使用されているか |
| > time_start | string | 席が使用されていれば, いつから使用されているか. HH:MM:SS形式 | 
| > staying_times | string[] | 席が利用されていた時間の配列, HH:MM:SS形式 | 
| > avg_stay_time | string | 座席平均利用時間 | 
| > feauture | string | 座席の特徴 | 
| > reservations | JSONArray | 座席の予約情報 | 
| >> reservation_id | string | 予約ID | 
| >> user_id | string | 利用者ID | 
| >> time_start | string | 予約時間(開始) | 
| >> time_end | string | 予約時間(終了) | 


### 店舗座席情報取得APIでのレスポンスメッセージ定義(失敗時)
> 店舗座席情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "9",
   "result": {
      "status": "error",
      "reason": "no restaurant matched"
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
| 店舗アカウントが見つからなかった | "no restaurant matched" |


## > 店舗食べログ情報取得API(getInfo/restaurant/evaluations)
店舗食べログ情報取得APIでは, その店舗に書き込まれた食べログ情報を返却する.

### 店舗食べログ情報取得APIでのリクエストメッセージ定義
> 店舗食べログ情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "19",
   "method": "getInfo/restaurant/evaluations",
   "params": {
      "restaurant_id": "123234",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
店舗食べログ情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| restaurant_id | string | 情報を取得したい店舗アカウントのIDを表す. |
| token | string | ログイン時に発行されたtoken |

### 店舗食べログ情報取得APIでのレスポンスメッセージ定義(成功時)
> 店舗食べログ情報取得API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "19",
   "result": {
      "status": "success",
      "evaluations": [
         {
            "evaluation_id": "123456231231",
            "restaurant_id": "123234",
            "user_id": "12345",
            "evaluation_grade": "3",
            "evaluation_comment": "まあまあ美味しかった"
         },
         {
            "evaluation_id": "123456231231",
            "restaurant_id": "123234",
            "user_id": "139834875",
            "evaluation_grade": "5",
            "evaluation_comment": "超美味しかった"
         },
         {
            "evaluation_id": "123456231231",
            "restaurant_id": "11209423",
            "user_id": "12345",
            "evaluation_grade": "1",
            "evaluation_comment": "クソまずかった"
         }
      ]
   }
}
```

店舗食べログ情報取得API実行成功時には次のようなメッセージが返却される.
| 返り値 | 型 | 説明 | 
| --------- | --- | --- | 
| status | string | "success" |
| evaluations | JSONArray | JSONオブジェクトの配列 |
| > evaluation_id | string | 食べログID |
| > restaurant_id | string | 常に検索したレストランのID |
| > user_id | string | 投稿したユーザのIDが入る |
| > evaluation_grade | string | 5段階評価, 1-5が入る |
| > evaluation_comment | string | 食べログのコメント |

### 店舗食べログ情報取得APIでのレスポンスメッセージ定義(失敗時)
> 店舗食べログ情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "9",
   "result": {
      "status": "error",
      "reason": "the restaurant has no evaluation"
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
| 店舗アカウントが見つからなかった | "no restaurant matched" |
| 検索した店舗は食べログ情報を持っていない | "The restaurant has no evaluation" |

## > 店舗情報検索API(getInfo/restaurants)
店舗情報検索APIでは, パラメータのキーワードがDBの店舗テーブルのfeaturesに部分一致する店舗アカウントのリストを返却する.

### 店舗情報検索APIでのリクエストメッセージ定義
> 店舗座席情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "19",
   "method": "getInfo/restaurants",
   "params": {
      "keyword": "居酒屋",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
店舗情報検索APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| restaurant_id | string | 情報を取得したい店舗アカウントのIDを表す. |
| token | string | ログイン時に発行されたtoken |

### 店舗情報検索APIでのレスポンスメッセージ定義(成功時)
> 店舗情報検索API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "19",
   "result": {
      "status": "success",
      "restaurants": [
         {
            "restaurant_id": "123456789",
            "restaurant_name": "abcdefg焼肉店",
            "email_addr": "example@example.com",
            "address": "高知県香美市土佐山田町xx番地yy",
            "time_open": "10:00",
            "time_close": "23:00",
            "features": "焼肉 ドリンクバー",
            "holidays": ["2021/12/24", "2021/12/25", "2022/01/01", "2022/0102"]
         },
         {
            "restaurant_id": "12345678123",
            "restaurant_name": "abcdefg居酒屋",
            "email_addr": "abcdefg@example.com",
            "address": "高知県香美市土佐山田町xx番地qwer",
            "time_open": "18:00",
            "time_close": "01:00",
            "features": "酒 居酒屋 sake alcohol",
            "holidays": ["2021/12/24", "2021/12/25", "2022/01/01", "2022/0102"]
         }
      ]
   }
}
```

店舗情報検索API実行成功時には次のようなメッセージが返却される.
| 返り値 | 型 | 説明 | 
| --------- | --- | --- | 
| status | string | "success" |
| restaurants | JSONArray | JSONオブジェクトの配列 |
| > restaurant_id | string | 店舗のID | 
| > restaurant_name | string | 店舗名 |
| > email_addr | string | 店舗のメールアドレス |
| > address | string | 店舗の住所 |
| > 店舗me_open | string | 店舗の始業時間 |
| > time_close | string | 店舗の終業時間 |
| > features | string | 特徴キーワード |
| > holidays | string[] | 休日の年月日, YYYY/MM/DD形式 |

### 店舗情報検索APIでのレスポンスメッセージ定義(失敗時)
> 店舗情報検索API-レスポンスメッセージの例(失敗時)
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
店舗情報検索APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行が失敗した理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| キーワードを含む店舗アカウントが見つからなかった | "no restaurant matched" |

## 管理者アカウント情報取得API
管理者アカウント情報取得APIでは下記の"管理者アカウント基本情報取得API"を提供する.
## > 管理者アカウント基本情報取得API(getInfo/admin/basic)
管理者アカウント基本情報取得APIでは, 管理者の基本情報(id, 名前, 誕生日など)が返却される. なお, このAPIは管理者本人のみしか実行出来ない. 他のユーザが実行した場合は403エラーが返却される. また, このAPIは管理者ID若しくは管理者名のどちらかによって検索可能である.

### 管理者アカウント基本情報取得APIでのリクエストメッセージ定義
> 管理者アカウント基本情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "789",
   "method": "getInfo/admin/basic",
   "params": {
      "searchBy": "admin_id",
      "user_id": "123452346789",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0"
   }
}
```
管理者アカウント基本情報取得APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| searchBy | string | 検索方法を表す.<br> 管理者アカウントIDによる検索 -> "admin_id"<br> 管理者アカウント名による検索 -> "admin_name" |
| admin_id | string | searchByが"admin_id"の場合に必須. 情報を取得したい管理者アカウントのIDを表す. |
| admin_name | string | searchByが"admin_name"の場合に必須. 情報を取得したい管理者アカウントの名前を表す. |
| token | string | ログイン時に発行されたtoken |

### 管理者アカウント基本情報取得APIでのレスポンスメッセージ定義(成功時)
> 管理者アカウント基本情報取得API-レスポンスメッセージの例(成功時, トークン発行者が検索対象の管理者である場合)
```json
{
   "jsonrpc": "2.0",
   "id": "789",
   "result": {
      "status": "success",
      "admin_id": "123456789",
      "admin_name": "IAmTheAdmin",
      "birthday": "2000/01/01",
      "gender": "male",
      "email_addr": "example@example.com",
      "address": "高知県香美市土佐山田町宮ノ口185"
   }
}
```
管理者アカウント基本情報取得APIの実行成功時には次のようなメッセージが返却される.

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "success" |
| admin_id | string | 管理者アカウントのID |
| admin_name | string | 管理者の名前 |
| birthday | string | 管理者の誕生日, YYYY/MM/DD形式 |
| gender | string | 管理者の性別 |
| email_addr | string | 管理者のメールアドレス |
| address | string | 管理者の住所 |

### 管理者アカウント基本情報取得APIでのレスポンスメッセージ定義(失敗時)
> 管理者アカウント基本情報取得API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "789",
   "result": {
      "status": "error",
      "reason": "no admin matched"
   }
}
```
管理者アカウント基本情報取得APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行が失敗した理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| パラメータsearchByがメッセージに含まれていない | "param.searchBy is not found" |
| パラメータsearchByが不正 | "params.searchBy is invalid. this should be "admin_id" or "admin_name" " |
| パラメータsearchByが"admin_id"であるが, パラメータに"admin_id"が含まれていない | "you specified "admin_id" in params.searchBy but there are not key("admin_id")" |
| パラメータsearchByが"admin_name"であるが, パラメータに"admin_name"が含まれていない| "you specified "admin_name" in params.searchBy but there are not key("admin_name")" |
| 管理者アカウントが見つからなかった | "no admin matched" |


# > 情報更新系API
情報更新系APIでは, 利用者アカウント情報更新API, 店舗アカウント情報更新API, 管理者アカウント情報更新APIの3種類のAPIを提供する.

## 利用者アカウント情報更新API
利用者アカウント情報更新APIでは, 利用者の基本情報の更新等を行う各種APIを提供する.
## > 利用者アカウント基本情報更新API(updateInfo/user/basic)
利用者アカウント基本情報更新APIは, DB上の利用者アカウント情報を更新することができる. ただし, 更新を行う事ができるのは利用者本人のみである. それ以外が実行しようとした場合は403エラーが返却される.

### 利用者アカウント基本情報更新APIでのリクエストメッセージ定義
> 利用者アカウント基本情報更新API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "method": "updateInfo/user/basic",
   "id": "487453",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "user_name": "IAmTheUser",
      "birthday": "2000/01/01",
      "gender": "male",
      "email_addr": "example@example.com",
      "address": "高知県香美市土佐山田町宮ノ口185"
   } 
}
```
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたトークン |
| user_name | string | 利用者の名前 |
| birthday | string | 利用者の誕生日, YYYY/MM/DD形式 | 
| gender | string | 利用者の性別 | 
| email_addr | string | 利用者のメールアドレス |
| address | string | 利用者の住所 | 

### 利用者アカウント基本情報更新APIでのレスポンスメッセージ定義(成功時)
> 利用者アカウント基本情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "success"
   }
}
```
利用者アカウント基本情報更新APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### 利用者アカウント基本情報更新APIでのレスポンスメッセージ定義(失敗時)
> 利用者アカウント基本情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "error",
      "reason": "403"
   }
}
```
利用者アカウント基本情報更新APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |



## 店舗アカウント情報更新API
店舗アカウント情報更新APIでは, 店舗の基本情報, 座席情報, 座席利用状況, 休日情報の更新等を行うことができる.

## > 店舗アカウント基本情報更新API(updateInfo/restaurant/basic)
店舗アカウント基本情報更新APIでは, DB上の店舗アカウントの基本情報を更新することができる.
ただし, このAPIを実行できるのは変更対象が店舗アカウント本人の時のみである. それ以外が実行しようとした場合は403エラーが返却される.

### 店舗アカウント基本情報更新APIでのリクエストメッセージ定義
> 店舗基本情報更新API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "10",
   "method": "updateInfo/restaurant/basic",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "restaurant_name": "qwerty焼肉店",
      "email_addr": "example2@example.com",
      "address": "高知県香美市土佐山田町xx番地zz",
      "time_open": "10:00",
      "time_close": "24:00",
      "features": "焼肉 ドリンクバー"
   }
}
```

### 店舗アカウント基本情報更新APIでのレスポンスメッセージ定義(成功時)
> 店舗基本情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "10",
   "result": {
      "status": "success",
   }
}
```
店舗アカウント基本情報更新APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### 店舗アカウント基本情報更新APIでのレスポンスメッセージ定義(失敗時)
> 店舗基本情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "10",
   "result": {
      "status": "error",
      "reason": "illegal time format",
   }
}
```

店舗アカウント情報更新APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行が失敗した理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 時刻の形式が不正 | "illegal time format" |


## > 店舗座席情報更新API(updateInfo/restaurant/seat)
店舗座席情報更新APIでは, 店舗の座席情報の追加・削除及び変更を行うことができる. 
ただし, このAPIを実行できるのは変更対象が店舗アカウント本人の時のみである. それ以外が実行しようとした場合は403エラーが返却される.

### 店舗座席情報更新APIでのリクエストメッセージ定義(座席情報追加)
> 店舗座席情報更新API-リクエストメッセージの例(座席情報追加)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "updateInfo/restaurant/seat",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "type": "new",
      "seatInfo": {
         "seat_name": "10番卓",
         "capacity": "4",
         "feature": "ボックス席"
      }
   }
}
```
店舗座席情報変更APIにおけるリクエストメッセージ(座席情報追加)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |
| type | string | 座席追加("new"),<br> 座席情報変更("change"),<br> 座席情報削除("delete")<br> を表す|
| seatInfo | JSONObject | 座席情報のJSONObject |
| > seat_name | string | 座席名 |
| > capacity | string | 座席に座ることができる人数 |
| > feature | string | 座席の特徴(自由記述) |

### 店舗座席情報更新APIでのリクエストメッセージ定義(座席情報変更)
> 店舗座席情報更新API-リクエストメッセージの例(座席情報変更)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "updateInfo/restaurant/seat",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "type": "change",
      "seatInfo": {
         "seat_id": "23456789",
         "seat_name": "10番卓",
         "capacity": "4",
         "feature": "ボックス席"
      }
   }
}
```
店舗座席情報更新APIにおけるリクエストメッセージ(座席情報変更)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |
| type | string | 座席追加("new"),<br> 座席情報変更("change"),<br> 座席情報削除("delete")<br> を表す|
| seatInfo | JSONObject | 座席情報のJSONObject |
| > seat_id | string | 変更したい座席ID |
| > seat_name | string | 座席名 |
| > capacity | string | 座席に座ることができる人数 |
| > feature | string | 座席の特徴(自由記述) |


### 店舗座席情報更新APIでのリクエストメッセージ定義(座席削除)
> 店舗座席情報取得API-リクエストメッセージの例(座席情報削除)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "updateInfo/restaurant/seat",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "type": "delete",
      "seat_id": "23456789"
   }
}
```
店舗座席情報変更APIにおけるリクエストメッセージ(座席情報変更)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |
| type | string | 座席追加("new"),<br> 座席情報変更("change"),<br> 座席情報削除("delete")<br> を表す|
| seat_id | string | 削除したい座席ID |

### 店舗座席情報更新APIでのレスポンスメッセージ定義(成功時)
> 店舗座席情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "success",
      "seat_id": "123456792"
   }
}
```
店舗座席情報更新APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |
| seat_id | string | 追加/変更した座席ID. ただし, 座席削除の場合はこの項目は含まれない. |


### 店舗座席情報更新APIでのレスポンスメッセージ定義(失敗時)
> 店舗座席情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "error",
      "reason": "the seat you want to delete/change is not yours"
   }
}
```

店舗座席情報更新APIの実行失敗時には, 次のようなメッセージが返却される.
| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 自分の店舗以外の座席情報を変更/削除しようとした | "the seat you want to delete/change is not yours" |

## > 店舗座席利用状況更新API(updateInfo/restaurant/seatsAvailability)
店舗座席利用状況更新APIでは, 店舗の座席利用状況を更新することができる. 
ただし, このAPIを実行できるのは変更対象が店舗アカウント本人の時のみである. それ以外が実行しようとした場合は403エラーが返却される.
### 店舗座席利用状況更新APIでのリクエストメッセージ定義
> 店舗座席利用状況情報取得API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "updateInfo/restaurant/seatAvailability",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "seats": [
         {
            "seat_id": "123456789",
            "is_filled": true
         },
         {
            "seat_id": "123456790",
            "is_filled": true
         },
         {
            "seat_id": "123456791",
            "is_filled": false
         },
         {
            "seat_id": "123456792",
            "is_filled": true
         },
      ]
   }
}
```
店舗座席利用状況変更APIにおけるリクエストメッセージでは, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |
| seats | JSONArray | 座席情報のJSONArray |
| > seat_id | string | 座席ID |
| > is_filled | string | 座席が使用されているかを表す<br> true->使用されている,<br> false->使用されていない|


### 店舗座席利用状況更新APIでのレスポンスメッセージ定義(成功時)
> 店舗座席利用状況更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "result": {
      "status": "success"
   }
}
```

店舗座席利用状況更新APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### 店舗座席利用状況更新APIでのレスポンスメッセージ定義(失敗時)
> 店舗座席利用状況更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "result": {
      "status": "error",
      "reason": "the seats that is not yours are included the request"
   }
}
```

店舗座席利用状況更新APIの実行失敗時には, 次のようなメッセージが返却される.
| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 自分の店舗以外の座席利用状況を変更しようとした | "the seats that is not yours are included the request" |


## > 店舗休日情報更新API(updateInfo/restaurant/holidays)
店舗休日情報更新APIでは, 店舗の休日情報を登録/削除することができる. 
ただし, このAPIを実行できるのは店舗アカウント本人のみである. それ以外が実行しようとした場合は403エラーが返却される.
なお, 休日追加を行う場合に既に登録している休日情報を再度追加しても構わない. ただし, 登録されていない休日情報を削除するようなリクエストが送信された場合, このAPIはエラーを返却する. この場合のエラーメッセージは別途定義する.

### 店舗休日情報更新APIでのリクエストメッセージ定義(休日追加)
> 店舗休日情報取得API-リクエストメッセージの例(休日追加)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "updateInfo/restaurant/holidays",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "type": "new",
      "holidays": ["2021/12/12", "2021/12/31", "2022/01/03", "2022/01/11"]
   }
}
```
店舗座席情報変更APIにおけるリクエストメッセージ(座席情報追加)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |
| type | string | 休日情報追加("new")もしくは休日情報削除("delete")を表す |
| holidays | string[] | 休日情報(YYYY/MM/DD)の配列 |

### 店舗休日情報更新APIでのリクエストメッセージ定義(休日削除)
> 店舗休日情報取得API-リクエストメッセージの例(休日削除)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "method": "updateInfo/restaurant/holidays",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "type": "delete",
      "holidays": ["2021/12/12", "2021/12/31", "2022/01/03", "2022/01/11"]
   }
}
```
店舗座席情報変更APIにおけるリクエストメッセージ(座席情報追加)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたtoken |
| type | string | 休日情報追加("new")もしくは休日情報削除("delete")を表す |
| holidays | string[] | 休日情報(YYYY/MM/DD)の配列 |


### 店舗休日情報更新APIでのレスポンスメッセージ定義(成功時)
> 店舗休日情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "result": {
      "status": "success",
   }
}
```
店舗休日情報更新APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### 店舗休日情報更新APIでのレスポンスメッセージ定義(失敗時)
> 店舗休日情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "11",
   "result": {
      "status": "error",
      "reason": "the holiday that you wanted to delete is not registered"
   }
}
```

店舗休日情報更新APIの実行失敗時には, 次のようなメッセージが返却される.
| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 休日情報にYYYY/MM/DD形式でない情報が含まれている | "illegal format included in holidays" |
| 削除しようとした休日情報は登録されていない | "the holiday that you wanted to delete is not registered" |


## 管理者アカウント情報更新API
管理者アカウント情報更新APIでは, 管理者の基本情報を更新するAPIを提供する.
## > 管理者アカウント基本情報更新API(updateInfo/admin/basic)
管理者アカウント基本情報更新APIでは, DB上の管理者テーブルにある情報を更新することができる. ただし, このAPIを実行できるのは, 管理者本人のみである.

### 管理者アカウント基本情報更新APIでのリクエストメッセージ定義
> 管理者アカウント基本情報更新API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "method": "updateInfo/admin/basic",
   "id": "487453",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "admin_name": "IAmTheUser",
      "birthday": "2000/01/01",
      "gender": "male",
      "email_addr": "example@example.com",
      "address": "高知県香美市土佐山田町宮ノ口185"
   } 
}
```
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたトークン |
| admin_name | string | 管理者の名前 |
| birthday | string | 管理者の誕生日, YYYY/MM/DD形式 | 
| gender | string | 管理者の性別 | 
| email_addr | string | 管理者のメールアドレス |
| address | string | 管理者の住所 | 

### 管理者アカウント基本情報更新APIでのレスポンスメッセージ定義(成功時)
> 管理者アカウント基本情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "success"
   }
}
```
管理者アカウント基本情報更新APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### 管理者アカウント基本情報更新APIでのレスポンスメッセージ定義(失敗時)
> 管理者アカウント基本情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "error",
      "reason": "403"
   }
}
```
管理者アカウント基本情報更新APIの実行失敗時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |


# > 共通情報更新API
共通情報更新APIでは, 予約情報と食べログ情報の情報更新を行うことができる.
なお, このAPIが実行できるのは, 予約/食べログを登録した利用者か, 予約/食べログを登録された店舗アカウントのみである. それ以外が実行した場合は403エラーが返却される.

## > 予約情報更新API(updateInfo/reservation)
予約情報更新APIでは, 予約情報の登録及び削除を行うことができる. ただし, 予約情報の登録を行うことができるのはトークン発行者が利用者アカウントのみの場合である.

### 予約情報更新APIでのリクエストメッセージ定義(予約情報登録)
> 予約情報更新API-リクエストメッセージの例(予約情報登録)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "method": "updateInfo/reservation",
   "params": {
      "type": "new",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "reservationData": {
         "restaurant_id": "49786123",
         "seat_id": "467831",
         "time_start": "1639636200000",
         "time_end": "1639643400000",
         "num_people": "5"
      }
   }
}
```
予約情報更新APIにおけるリクエストメッセージ(登録)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| type | string | 予約情報登録("new")か, 予約情報削除("delete")を表す. |
| token | string | ログイン時に発行されたtoken |
| reservationData | JSONObject | 予約情報のJSONデータ |
| > restaurant_id | string | 予約したい店舗のID |
| > seat_id | string | 予約したい座席のID |
| > time_start | string | 予約開始時間 |
| > time_end | string | 予約終了時間 |
| > num_people | string | 一緒に行く人数 |

### 予約情報更新APIでのリクエストメッセージ定義(予約情報削除)
> 予約情報更新API-リクエストメッセージの例(予約情報削除)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "method": "updateInfo/reservation",
   "params": {
      "type": "delete",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "reservation_id": "23456789"
   }
}
```
予約情報更新APIにおけるリクエストメッセージ(削除)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| type | string | 予約情報登録("new")か, 予約情報削除("delete")を表す. |
| token | string | ログイン時に発行されたtoken |
| reservation=id | string | 予約ID |

### 予約情報更新APIでのレスポンスメッセージ定義(成功時)
> 予約情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "6",
   "result": {
      "status": "success",
      "reservation_id": "4674861"
   }
}
```

予約情報更新APIの実行成功時には次のようなメッセージが返却される.
| 返り値 | 型 | 説明 | 
| --------- | --- | --- | 
| status | string | "success" |
| reservation_id | string | 登録した予約情報のID, ただし, 予約削除リクエストの場合はこの項目はメッセージに含まれない |

### 予約情報更新APIでのレスポンスメッセージ定義(失敗時)
> 予約情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "6",
   "result": {
      "status": "error",
      "reason": "invalid reservation time"
   }
}
```

予約情報更新APIの実行失敗時には次のようなメッセージが返却される.

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 削除しようとした予約IDが見つからない | "the reservation_id that you wanted to delete was not found" |
| 登録しようとした座席IDが見つからない | "the seat_id is invalid" |
| 座席に座れる人数に対して予約人数が多すぎる | "num_people is too much" |
| 予約しようとした時間が営業時間外である | "time of reservation is out of business hours" |
| time_endがtime_startより小さい | "invalid reservation time" |
| 店舗アカウントが予約情報を登録しようとした | "restaurant account can not register reservation" |


## > 食べログ情報更新API(updateInfo/evaluation)
食べログ情報更新APIでは, 食べログ情報の投稿, 変更または削除を行うことができる. 
ただし, 食べログ情報の登録/変更ができるのは利用者アカウントのみであり, 店舗アカウントは削除のみ可能である.

### 食べログ情報更新APIでのリクエストメッセージ定義(食べログ登録)
> 食べログ情報更新APIでのリクエストメッセージ定義(食べログ登録)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "method": "updateInfo/evaluation",
   "params": {
      "type": "new",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "evaluationData": {
         "restaurant_id": "123456789",
         "evaluation_grade": "3",
         "evaluation_comment": "まあまあ"
      }
   }
}
```
食べログ情報更新APIにおけるリクエストメッセージ(食べログ登録)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| type | string | 食べログ情報登録("new")<br>食べログ情報変更("change")<br>食べログ情報削除("delete")<br>のいずれか  |
| token | string | ログイン時に発行されたtoken |
| evaluationData | JSONObject | 食べログ情報のJSONデータ |
| > restaurant_id | string | 食べログを書き込む店舗ID |
| > evaluation_grade | string | 5段階評価(1-5) |
| > evaluation_comment | string | 食べログ(コメント) |

### 食べログ情報更新APIでのリクエストメッセージ定義(食べログ変更)
> 食べログ情報更新APIでのリクエストメッセージ定義(食べログ変更)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "method": "updateInfo/evaluation",
   "params": {
      "type": "change",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "evaluationData": {
         "evaluation_id": "123456789",
         "evaluation_grade": "5",
         "evaluation_comment": "やっぱり美味しかったかも"
      }
   }
}
```
食べログ情報更新APIにおけるリクエストメッセージ(食べログ登録)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| type | string | 食べログ情報登録("new")<br>食べログ情報変更("change")<br>食べログ情報削除("delete")<br>のいずれか  |
| token | string | ログイン時に発行されたtoken |
| evaluationData | JSONObject | 食べログ情報のJSONデータ |
| > evaluation_id | string | 編集したい食べログID |
| > evaluation_grade | string | 5段階評価(1-5) |
| > evaluation_comment | string | 食べログ(コメント) |

### 食べログ情報更新APIでのリクエストメッセージ定義(食べログ削除)
> 食べログ情報更新APIでのリクエストメッセージ定義(食べログ削除)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "method": "updateInfo/evaluation",
   "params": {
      "type": "delete",
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "evaluation_id": "123456789"
   }
}
```
食べログ情報更新APIにおけるリクエストメッセージ(食べログ登録)では, 次のパラメータが含まれている必要がある.
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| type | string | 食べログ情報登録("new")<br>食べログ情報変更("change")<br>食べログ情報削除("delete")<br>のいずれか  |
| token | string | ログイン時に発行されたtoken |
| evaluation_id | JSONObject | 削除したい食べログID |


### 食べログ情報更新APIでのレスポンスメッセージ定義(成功時)
> 食べログ情報更新API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "result": {
      "status": "success",
      "evaluation_id": "4674861"
   }
}
```
食べログ情報更新APIの実行成功時には次のようなメッセージが返却される.
| 返り値 | 型 | 説明 | 
| --------- | --- | --- | 
| status | string | "success" |
| evaluation_id | string | 登録/変更した食べログ情報のID, ただし, 食べログ削除リクエストの場合はこの項目はメッセージに含まれない |

### 食べログ情報更新APIでのレスポンスメッセージ定義(失敗時)
> 食べログ情報更新API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "7895",
   "result": {
      "status": "error",
      "reason": "evaluation_grade is illegal"
   }
}
```
食べログ情報更新APIの実行失敗時には次のようなメッセージが返却される.

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 食べログを登録しようとした店舗IDが見つからない | "there is no restaurant that you specified in params.restaurant_id " |
| 変更/削除しようとした食べログIDが見つからない | "the evaluation_id that you wanted to delete or change was not found" |
| evaluation_grade が1-5の範囲外 | "evaluation_grade is illegal" |



# アカウント退会系API
アカウント退会系APIでは, 通常のアカウント退会APIと強制退会APIの2種類が提供される.
## アカウント退会API(resign)
アカウント退会APIでは, 各クライアントからの要求により, DB上から各種アカウント情報を削除する. ただし, このAPIを実行することができるのは, 各アカウントの本人のみである. それ以外が実行しようとした場合は403エラーが返却される.

### アカウント退会APIでのリクエストメッセージ定義
> アカウント退会API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "method": "resign",
   "id": "487453",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "password": "YourPassWord"
   } 
}
```
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行されたトークン |
| password | string | 各クライアントアカウントのパスワード(確認) |


### アカウント退会APIでのレスポンスメッセージ定義(成功時)
> アカウント退会API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "success"
   }
}
```
アカウント退会APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### アカウント退会APIでのレスポンスメッセージ定義(失敗時)
> アカウント退会API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "error",
      "reason": "the password is wrong"
   }
}
```

アカウント退会APIの実行失敗時には, 次のようなメッセージが返却される.
| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| 確認用パスワードが間違っている | "the password is wrong" |

## アカウント強制退会API(resign/forced)
アカウント強制退会APIでは, 管理者からの要求により, DB上から各アカウント情報(ただし, 利用者アカウントと店舗アカウントのみ)を強制的に削除する. ただし, このAPIを実行することができるのは管理者アカウントのみである. それ以外が実行しようとした場合は403エラーが返却される.

### アカウント強制退会APIでのリクエストメッセージ定義
> アカウント退会API-リクエストメッセージの例
```json
{
   "jsonrpc": "2.0",
   "method": "resign",
   "id": "487453",
   "params": {
      "token": "634ba39e-bf6f-93c5-f9dd-f1597c0683b0",
      "account_role": "user",
      "account_id": "123456789"
   } 
}
```
| パラメータ | 型 | 説明 |
| --------- | --- | --- |
| token | string | ログイン時に発行された管理者トークン |
| account_role | string | 削除したいアカウントの種別<br>利用者 -> "user",<br> 店舗 -> "restaurant" |
| account_id | string | 削除したいアカウントID |

### アカウント強制退会APIでのレスポンスメッセージ定義(成功時)
> アカウント強制退会API-レスポンスメッセージの例(成功時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "success"
   }
}
```
アカウント強制退会APIの実行成功時には次のようなメッセージが返却される

| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "success" |

### アカウント強制退会APIでのレスポンスメッセージ定義(失敗時)
> アカウント強制退会API-レスポンスメッセージの例(失敗時)
```json
{
   "jsonrpc": "2.0",
   "id": "487453",
   "result": {
      "status": "error",
      "reason": "there is no such account"
   }
}
```

アカウント強制退会APIの実行失敗時には, 次のようなメッセージが返却される.
| 返り値 | 型 | 内容/説明 |
| --------- | --- | --- |
| status | string | "error" |
| reason | string | 実行失敗理由 |

実行が失敗した理由において, 共通エラー以外のreasonの内容は次の通りである.
| 失敗理由 | reasonの内容 |
|--------|------|
| account_roleが不正 | "account_role is illegal" |
| 削除したいアカウントIDが存在しない | "there is no such account" |