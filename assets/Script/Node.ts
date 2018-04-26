// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    public isCollision: boolean = false;

    start() {
        this.node.x = cc.random0To1() * cc.Canvas.instance.node.width;
        this.node.y = cc.random0To1() * cc.Canvas.instance.node.height;
    }

    update(dt) {
        // let speed = 3;
        // this.node.x += cc.randomMinus1To1() * speed;
        // this.node.y += cc.randomMinus1To1() * speed;
    }

    public setIsCollision(isCollision) {
        this.isCollision = isCollision;
        if (isCollision) {
            this.node.color = cc.color(255, 0, 0);
        } else {
            this.node.color = cc.color(255, 255, 255);
        }
    }
}
