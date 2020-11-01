# termux-ytdl-sb
*どうやってインストールするの？*
まずはtermuxとtermuxAPIと言うアプリをダウンロードしよう！！（無料だよ！！)  
その後次のコマンドを実行してね
```bash
apt update
apt upgrade
termux-setup-storage
pkg install termux-api
apt install git
pkg install ffmpeg
apt install nodejs
cd ~
mkdir bin
cd ~/bin
git clone https://github.com/Rollphes/termux-ytdl-sb
mv ~/bin/termux-ytdl-sb/termux-url-opener ~/bin/termux-url-opener
chmod +x termux-url-opener
```
