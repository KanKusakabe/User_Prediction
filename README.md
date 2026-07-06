# 🔮 音声刺激 → ユーザ動作 エクスプローラ（Web デモ）

視覚障害者ナビの **音声指示に対してユーザ（頭）がどう動くか** を、ユーザ実験データ（128 試行）と
学習した **Normalizing Flow** モデルの成果として、ブラウザ上で対話的に見られる**静的サイト**です。

- **刺激を選ぶ → 実データでの反応曲線（潜時・±33°・個人差の帯）** を表示。
- **モデルの性能**（基線を桁違いに上回る NLL）を表示。
- 完全にクライアントサイド（HTML/CSS/JS + Plotly.js）。サーバ不要 → **GitHub Pages でそのまま公開可能**。

## 🔒 データの扱い（重要）

トップの解説ページ（`index.html` / `data.json`）は **集計済みの平均反応曲線（平均＋25–75%帯）と
要約指標のみ**で、そこから元データは復元できません。

`replays/` には **個別トライアルの再生動画（128 本・頭部軌跡＋モデル予測扇＋実音声）** を掲載しています。
これは個人レベルの記録ですが、**研究成果としての公開について参加者の同意を得た範囲**で公開しています。
（rosbag そのものや SLAM 生データは含みません。）

## ローカルで見る

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```
（`fetch('data.json')` を使うため、`file://` で直接開くのではなく上記のように簡易サーバ経由で開いてください。）

## GitHub Pages で公開する

1. このフォルダ（`webdemo/`）を **新しい GitHub リポジトリ**として push する：
   ```bash
   git init && git add . && git commit -m "音声刺激エクスプローラ"
   git branch -M main
   git remote add origin https://github.com/<ユーザ名>/<リポジトリ名>.git
   git push -u origin main
   ```
2. GitHub の **Settings → Pages** で、Source を **Deploy from a branch**、Branch を **`main` / `(root)`** に設定。
3. 数十秒後、`https://<ユーザ名>.github.io/<リポジトリ名>/` で公開されます。

## 図・数値を更新する（親プロジェクト側）

データやモデルを更新したら、親の `motionsim` プロジェクトで `data.json` を再生成できます：
```bash
uv run python -m motionsim.export_web   # -> webdemo/data.json を再生成
```

## 構成

```
webdemo/
├── index.html   ページ本体
├── style.css    スタイル
├── app.js       Plotly 描画・ボタン切替
├── data.json    集計済み反応曲線＋指標（生データは含まない）
└── README.md
```
