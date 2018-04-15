export class QuadTree {

    private root = null;

    public constructor(bounds, pointQuad, maxDepth?, maxChildren?) {
        var node;
        if (pointQuad) {
            node = new Node(bounds, 0, maxDepth, maxChildren);
        } else {
            node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
        }
        this.root = node;
    }

    public insert(item) {
        if (item instanceof Array) {
            var len = item.length;
            for (var i = 0; i < len; i++) {
                this.root.insert(item[i]);
            }
        } else {
            this.root.insert(item);
        }
    }

    public clear() {
        this.root.clear();
    }

    public retrieve(item) {
        var out = this.root.retrieve(item).slice(0);
        return out;
    }
}


export class Node {
    //subnodes
    protected nodes = null;

    //children contained directly in the node
    protected children = null;
    private _bounds = null;

    //read only
    protected _depth = 0;

    protected _maxChildren = 4;
    protected _maxDepth = 4;

    public static TOP_LEFT = 0;
    public static TOP_RIGHT = 1;
    public static BOTTOM_LEFT = 2;
    public static BOTTOM_RIGHT = 3;

    public constructor(bounds, depth, maxDepth, maxChildren) {
        this._bounds = bounds;
        this.children = [];
        this.nodes = [];

        if (maxChildren) {
            this._maxChildren = maxChildren;
        }

        if (maxDepth) {
            this._maxDepth = maxDepth;
        }

        if (depth) {
            this._depth = depth;
        }
    }

    public insert(item) {
        if (this.nodes.length) {
            var index = this._findIndex(item);
            this.nodes[index].insert(item);
            return;
        }

        this.children.push(item);

        var len = this.children.length;
        if (!(this._depth >= this._maxDepth) &&
            len > this._maxChildren) {

            this.subdivide();

            var i;
            for (i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }

            this.children.length = 0;
        }
    }

    public retrieve(item) {
        if (this.nodes.length) {
            var index = this._findIndex(item);

            return this.nodes[index].retrieve(item);
        }

        return this.children;
    }

    public _findIndex(item) {
        var b = this._bounds;
        // var left = (item.x > b.x + b.width / 2) ? false : true;
        // var top = (item.y > b.y + b.height / 2) ? false : true;
        let left = (item.x < 0) ? true : false;
        let top = (item.y > 0) ? true : false;

        //top left
        var index = Node.TOP_LEFT;
        if (left) {
            //left side
            if (!top) {
                //bottom left
                index = Node.BOTTOM_LEFT;
            }
        } else {
            //right side
            if (top) {
                //top right
                index = Node.TOP_RIGHT;
            } else {
                //bottom right
                index = Node.BOTTOM_RIGHT;
            }
        }
        return index;
    }

    public subdivide() {
        var depth = this._depth + 1;

        // var bx = this._bounds.x;
        // var by = this._bounds.y;

        // //floor the values
        var b_w_h = (this._bounds.width / 2); //todo: Math.floor?
        var b_h_h = (this._bounds.height / 2);
        // var bx_b_w_h = bx + b_w_h;
        // var by_b_h_h = by + b_h_h;

        //top left
        this.nodes[Node.TOP_LEFT] = new Node({
            x: -b_w_h,
            y: b_h_h,
            width: b_w_h,
            height: b_h_h
        },
            depth, this._maxDepth, this._maxChildren);

        //top right
        this.nodes[Node.TOP_RIGHT] = new Node({
            x: 0,
            y: b_w_h,
            width: b_w_h,
            height: b_h_h
        },
            depth, this._maxDepth, this._maxChildren);

        //bottom left
        this.nodes[Node.BOTTOM_LEFT] = new Node({
            x: -b_w_h,
            y: 0,
            width: b_w_h,
            height: b_h_h
        },
            depth, this._maxDepth, this._maxChildren);


        //bottom right
        this.nodes[Node.BOTTOM_RIGHT] = new Node({
            x: 0,
            y: 0,
            width: b_w_h,
            height: b_h_h
        },
            depth, this._maxDepth, this._maxChildren);
    }

    public clear() {
        this.children.length = 0;

        var len = this.nodes.length;

        var i;
        for (i = 0; i < len; i++) {
            this.nodes[i].clear();
        }

        this.nodes.length = 0;
    }
}

export class BoundsNode extends Node {

    protected _stuckChildren = null;
    protected _out = [];

    public constructor(bounds, depth, maxChildren, maxDepth) {
        super(bounds, depth, maxChildren, maxDepth);
    }

    public insert(item) {
        if (this.nodes.length) {
            var index = this._findIndex(item);
            var node = this.nodes[index];

            //todo: make _bounds bounds
            var b_w_h = (node._bounds.width / 2);
            var b_h_h = (node._bounds.height / 2);
            let minX = node._bounds.x - b_w_h;
            let maxX = node._bounds.x + b_w_h;
            let minY = node._bounds.y - b_h_h;
            let maxY = node._bounds.y + b_h_h;
            if (item.x - item.anchorX * item.width >= minX &&
                item.x + item.anchorX * item.width <= maxX &&
                item.y - item.anchorY * item.height >= minY &&
                item.y + item.anchorY * item.height <= maxY) {

                this.nodes[index].insert(item);

            } else {
                this._stuckChildren.push(item);
            }

            return;
        }

        this.children.push(item);

        var len = this.children.length;

        if (!(this._depth >= this._maxDepth) &&
            len > this._maxChildren) {

            this.subdivide();

            var i;
            for (i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }

            this.children.length = 0;
        }
    }

    public getChildren() {
        return this.children.concat(this._stuckChildren);
    }

    public retrieve(item) {
        var out = this._out;
        out.length = 0;
        if (this.nodes.length) {
            var index = this._findIndex(item);
            var node = this.nodes[index];

            var b_w_h = (node._bounds.width / 2);
            var b_h_h = (node._bounds.height / 2);
            let minX = node._bounds.x - b_w_h;
            let maxX = node._bounds.x + b_w_h;
            let minY = node._bounds.y - b_h_h;
            let maxY = node._bounds.y + b_h_h;
            if (item.x - item.anchorX * item.width >= minX &&
                item.x + item.anchorX * item.width <= maxX &&
                item.y - item.anchorY * item.height >= minY &&
                item.y + item.anchorY * item.height <= maxY) {

                out.push.apply(out, this.nodes[index].retrieve(item));
            } else {
                //Part of the item are overlapping multiple child nodes. For each of the overlapping nodes, return all containing objects.

                if (item.x <= this.nodes[Node.TOP_RIGHT]._bounds.x) {
                    if (item.y <= this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.TOP_LEFT].getAllContent());
                    }

                    if (item.y + item.height > this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.BOTTOM_LEFT].getAllContent());
                    }
                }

                if (item.x + item.width > this.nodes[Node.TOP_RIGHT]._bounds.x) {//position+width bigger than middle x
                    if (item.y <= this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.TOP_RIGHT].getAllContent());
                    }

                    if (item.y + item.height > this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.BOTTOM_RIGHT].getAllContent());
                    }
                }
            }
        }

        out.push.apply(out, this._stuckChildren);
        out.push.apply(out, this.children);

        return out;
    }

    public getAllContent() {
        var out = this._out;
        if (this.nodes.length) {

            var i;
            for (i = 0; i < this.nodes.length; i++) {
                this.nodes[i].getAllContent();
            }
        }
        out.push.apply(out, this._stuckChildren);
        out.push.apply(out, this.children);
        return out;
    }

    public clear() {
        this._stuckChildren.length = 0;

        //array
        this.children.length = 0;

        var len = this.nodes.length;

        if (!len) {
            return;
        }

        var i;
        for (i = 0; i < len; i++) {
            this.nodes[i].clear();
        }

        //array
        this.nodes.length = 0;
    }
}
