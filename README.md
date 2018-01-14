# pfoe_web_debugger

PFoEの教示とリプレイが行えるパッケージ（[ryuichiueda/raspimouse_gamepad_teach_and_replay](https://github.com/ryuichiueda/raspimouse_gamepad_teach_and_replay/)）のデバッグがWeb上で行えるパッケージです。

## Description

使用可能な機能

* パーティクルフィルタの状態をリアルタイムで可視化
* センサ、速度の情報の表示
* ラズパイマウスのトグルボタンを遠隔で操作 ※1
* ラズパイマウスを操作できる仮想のジョイパッドコントローラ ※2
* PCだけではなく、スマートフォンでも利用可能 ※3

※1:使用するには（[ryuichiueda/raspimouse_ros_2](https://github.com/ryuichiueda/raspimouse_ros_2)）を一部変更した（[AtsushiSaito/raspimouse_ros_2](https://github.com/AtsushiSaito/raspimouse_ros_2)）が必要です。

※2:スマートフォンのみ利用可能。

※3:PC版とスマートフォン版は同じアドレスにアクセスすると自動で切り替わります。

## Demo

[PFoE WebDebugger - YouTube](https://www.youtube.com/watch?v=aJeUpCKPnZ4)

## Requirements
* Raspberry Pi Mouse
* Ubuntu 16.04
* ROS Kinetic
* ROS package
  * ros-kinetic-rosbridge-suite
  * [ryuichiueda/raspimouse_gamepad_teach_and_replay](https://github.com/ryuichiueda/raspimouse_gamepad_teach_and_replay/)
  * [AtsushiSaito/raspimouse_ros_2](https://github.com/AtsushiSaito/raspimouse_ros_2)

## Installation

ros-kinetic-rosbridge-suiteをインストールします。
```
$ sudo apt install ros-kinetic-rosbridge-suite
```
以下のコマンドで実行
```
$ cd ~/catkin_ws/src/
$ git clone https://github.com/AtsushiSaito/pfoe_web_debugger.git
$ cd ~/catkin_ws && catkin_make && source ~/catkin_ws/devel/setup.bash
$ roslaunch raspimouse_gamepad_teach_and_replay teach_and_replay.launch
$ roslaunch pfoe_web_debugger pfoe_web_debugger.launch
```

ROSが起動しているPCのIPアドレスを調べ、PCやスマートフォンのブラウザから以下のようにアクセスします。
```
IPアドレス:8000
# 例 -> 192.168.0.33:8000
```

## Usage

### スマートフォン版
<img src=https://github.com/AtsushiSaito/image_data/blob/master/pfoe_web_debugger_sp.png width=100%>

### PC版
<img src=https://github.com/AtsushiSaito/image_data/blob/master/pfoe_web_debugger_pc.png width=100%>
