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

    private nodes: Array<cc.Node> = [];
    private tree: QuadTree<cc.Node> = null;

    start() {
        var bounds = {
            x: 0,
            y: 0,
            width: cc.Canvas.instance.node.width,
            height: cc.Canvas.instance.node.height
        }
        this.tree = new QuadTree(bounds, true);

        for (let i = 0; i < 150; i++) {
            let newNode = cc.instantiate(this.nodePrefab);
            this.node.addChild(newNode);
            this.nodes.push(newNode);
        }
        this.tree.insert(this.nodes);
    }

    update(dt) {

        for (let i in this.nodes) {
            this.nodes[i].getComponent("Node").setIsCollision(false);
        }

        this.tree.clear();
        this.tree.insert(this.nodes);

        for (let i in this.nodes) {
            let curNode = this.nodes[i];
            let items = this.tree.retrieve(curNode);
            for (let i in items) {
                let item = items[i];

                if (item.uuid == curNode.uuid) {
                    continue;
                }

                let curScript = curNode.getComponent("Node");
                let itemScript = item.getComponent("Node");

                if (curScript.isCollision && itemScript.isCollision) {
                    continue;
                }

                let isCollision = this.isCollision(curNode, item);

                if (!curScript.isCollision) {
                    curScript.setIsCollision(isCollision);
                }

                if (!itemScript.isCollision) {
                    itemScript.setIsCollision(isCollision);
                }
            }
        }
    }

    isCollision(node1, node2) {
        let node1Left = node1.x;
        let node2Left = node2.x;
        let node1Top = node1.y - node1.height;
        let node2Top = node2.y - node2.height;

        return node1Left < node2Left + node2.width &&
            node1Left + node1.width > node2Left &&
            node1Top < node2Top + node2.height &&
            node1Top + node1.height > node2Top
    }
}
