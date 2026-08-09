制作実績（SELECTED WORKS）の画面キャプチャ
==========================================================

/business/web-production の「SELECTED WORKS」で、PC画面とスマートフォン画面の
モックアップ枠に表示している画像です。いずれも公開中の実サイトを
ブラウザで実際に表示して撮影したものです（生成画像・合成は行っていません）。

  rafale-pc.jpg   1440 x 900   … https://rafale-hd.jp/   PC（1440px幅で撮影）
  rafale-sp.jpg    780 x 1648  … https://rafale-hd.jp/   スマートフォン（390px幅で撮影・2倍保存）
  sakura-pc.jpg   1440 x 900   … https://sakura-poker.jp/ PC（1440px幅で撮影）
  sakura-sp.jpg    780 x 1648  … https://sakura-poker.jp/ スマートフォン（390px幅で撮影・2倍保存）

撮影位置
  RAFALE  … TOPのファーストビュー（右の「動きのあるR」が描き終わった状態）
  SAKURA  … TOPのファーストビュー（ロゴ・キャッチコピー・店内写真が入る位置）
  どちらもページ最上部（スクロール量0）。アドレスバーや開発者ツールは写っていません。

枠との関係
  PC枠   … 16:10（画像も 1440x900 なので、切り取られずそのまま収まります）
  スマホ枠 … 9:19（画像も 780x1648 なので、ほぼ切り取られません）
  表示は business/web-production.html の
    style="--shot: url('/img/works/rafale-pc.jpg?v=1')"
  で指定しています。

差し替えるとき
  1. 同じファイル名・同じ縦横比で上書きする
  2. business/web-production.html の url(...) 末尾の ?v=1 を ?v=2 のように上げる
     （/img/* は _headers で1週間キャッシュされるため、番号を上げないと
       古い画像が表示され続けます）

再撮影のしかた（参考）
  ・PC   … ブラウザのウィンドウ幅1440px、高さ900pxで最上部を撮影
  ・スマホ … 開発者ツールのデバイスモードで幅390px・DPR2にして最上部を撮影
  ・JPEG 画質90前後、150〜400KB程度に収めてください
