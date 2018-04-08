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
import { QuadTree, Node, BoundsNode } from "./QuadTree";

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    nodePrefab: cc.Prefab = null;

    private nodes = [];
    private tree: QuadTree = null;

    start() {
        var bounds = {
            x: 0,
            y: 0,
            width: cc.Canvas.instance.node.width,
            height: cc.Canvas.instance.node.height
        }
        this.tree = new QuadTree(bounds, true);

        for (let i = 0; i < 50; i++) {
            let newNode = cc.instantiate(this.nodePrefab);
            this.node.addChild(newNode);
            this.nodes.push(newNode);
        }
        this.tree.insert(this.nodes);
    }

    update(dt) {
        this.tree.clear();
        this.tree.insert(this.nodes);

        for (let i in this.nodes) {
            let items = this.tree.retrieve(this.nodes[i]);
            //console.log(items);
        }
    }
}
