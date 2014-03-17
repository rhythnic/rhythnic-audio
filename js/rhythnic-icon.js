var RhythnicIconMaker = {
    
    NS : "http://www.w3.org/2000/svg",
    
    draw : function(type, dad, title){
        var parent = dad || document.createElementNS(this.NS, "svg");
        bp = this.icons[type];  //bp for blueprint
        parent.setAttribute("viewBox", bp.viewBox);
        return this.drawChildren(parent, bp.children, title);
    },
    
    drawChildren : function(parent, children, title){
        for (var i = 0; i < children.length; i++) {
            var shape = this.createChild(children[i], title);
            parent.appendChild(shape);
        }
        return parent;
    },
    
    createChild : function(bp, title){
        //create element
        elem = document.createElementNS(this.NS, bp.type);
        
        if (("title" in bp) && (title || bp.title)) {
            var titleTag = document.createElementNS(this.NS, "title");
            if (title) titleTag.innerHTML = title;
            else titleTag.innerHTML = bp.title;
            elem.appendChild(titleTag);
        }
        
        for (var key in bp.attr) { elem.setAttribute(key, bp.attr[key]); }
        for (key in bp.style)    { elem.style.setProperty(key, bp.style[key]); }
        if (bp.class) {
            bp.class.forEach(function(c) { elem.classList.add(c); });
        }
        
        if (bp.children) {
            elem = this.drawChildren(elem, bp.children, title);
        }
        
        return elem;
    },

    icons: {
        
        play: {
            viewBox: "0 0 12 12",
            children : [{
                type : "polygon",
                attr: { points: "1,1 11,6 1,11" },
                title: "Play"
            }]
        },
        
        pause: {
            viewBox: "0 0 12 12",
            children: [{
                type : "rect",
                attr: { width: "4", height: "10", x: "1", y: "1", rx: "1", ry: "1" }
                },{
                type : "rect",
                attr: { width: "4", height: "10", x: "7", y: "1", rx: "1", ry: "1" }
                },{
                type : "rect",
                attr:  { width: "12", height: "12", "fill-opacity": "0", "stroke-opacity": "0"},
                title: "Pause"
            }]
        },

        menu: {
            viewBox: "0 0 16 12",
            children: [{
                type : "rect",
                attr : { width: "14", height: "2", x: "1", y: "1"}
                },{
                type : "rect",
                attr : { width: "14", height: "2", x: "1", y: "5"}
                },{
                type : "rect",
                attr : { width: "14", height: "2", x: "1", y: "9"}
                },{
                type : "rect",
                attr: { width:  "16", height: "12", "fill-opacity": "0", "stroke-opacity": "0"},
                title: "Menu"
            }]
        }
    }
};
    
var RhythnicIcon = new Object(RhythnicIconMaker);