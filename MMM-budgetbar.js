https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash >>> 0;
};

function updateGraph(module, payload){
    if(Object.keys(module.bars).length == 0){
        for(var budget in module.config.budgets){
            var budget_name = module.config.budgets[budget];
            var bar = new ProgressBar.Line("[id='" + budget_name.hashCode() + "']", {
                strokeWidth: 15,
                easing: 'easeInOut',
                duration: 1400,
                color: '#FFEA82',
                trailColor: '#eee',
                trailWidth: 15,
                from: {color: '#00FF00'},
                to: {color: '#FF0000'},
                step: (state, bar) => {
                    bar.path.setAttribute('stroke', state.color);
                }
            });
            module.bars[budget_name] = bar;
        }
    }

    var payload_obj = JSON.parse(payload);
    for(var budget in module.config.budgets){
        var budget_name = module.config.budgets[budget];
        var bar = module.bars[budget_name];
        var data = payload_obj[budget_name]

        var current = data["amt"];
        var max = data["bgt"];
        var new_value = Math.min(current / max, 1.0);
        
        var value_td = document.querySelector("[id='" + budget_name.hashCode() + "-value']");
        value_td.innerHTML = "$" + (Math.round(max - current) * 100) / 100;
        bar.animate(new_value);
    }
}

Module.register("MMM-budgetbar",{
    defaults: {
        title: "Budget",
        budgets: ['BudgetCategory1', 'BudgetCategory2', 'BudgetCategory3'],
        port: 20020
    },

    getDom: function() {
	var outer = document.createElement("div");
	outer.classList.add("medium");
	outer.classList.add("bar_title");
	outer.innerHTML = this.config.title;
	outer.appendChild(document.createElement("hr"));

        var table = document.createElement("table");
        table.classList.add("bar_table");

        for(var budget in this.config.budgets){
            var tr = document.createElement("tr");
            var tdTitle = document.createElement("td");        
            tdTitle.innerHTML = this.config.budgets[budget];
            tdTitle.classList.add("bar_text");

            var tdBar = document.createElement("td");        
            tdBar.id = "" + this.config.budgets[budget].hashCode();
            tdBar.classList.add("bar_container");
            
            var tdValue = document.createElement("td");
            tdValue.id = "" + this.config.budgets[budget].hashCode() + "-value";
            tdValue.classList.add("bar_text");
            tdValue.innerHTML = "$0.00";

            tr.appendChild(tdTitle);
            tr.appendChild(tdBar);
            tr.appendChild(tdValue);
            table.appendChild(tr);
        }

	outer.appendChild(table);
        
        return outer;
    },

    getScripts: function() {
		return ["progressbar.min.js"];
    },
    
    getStyles: function () {
		return ["MMM-budgetbar.css"];
    },
    
    start: function() {
        Log.info(this.name + " Starting up");
        this.bars = [];

        this.updateDom();
        this.sendSocketNotification("REGISTER", this.config);
    },
    
    socketNotificationReceived: function(notification, payload) {
        if(notification == this.config.title){
            updateGraph(this, payload);
        }
    }
});
