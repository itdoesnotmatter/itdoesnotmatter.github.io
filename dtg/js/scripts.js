svgTable = (function(){
    const coords = {
        5: [
            [55, 12], [67.5, 12], [80, 12],
            [55, 43], [67.5, 43], [80, 43],
            [55, 58.5], [67.5, 58.5], [80, 58.5],
            [55, 74], [67.5, 74], [80, 74]
        ],
        0: [
            [30, 12],
            [30, 27.5],
            [30, 43],
            [17.5, 58.5], [30, 58.5],
            [30, 74],
            [30, 89.5]
        ]
    };
    const multipliers = {
        5: [
            5, 11, 5,
            8, 17, 8,
            17, 35, 17,
            8, 17, 8
        ],
        0: [
            8,
            17,
            11,
            35, 17,
            11,
            17
        ]
    };
    const defaults = {
        winningNumber: 5,
        winningNumber5frequency: 0.7,
        emptyBetFrequency: 0.4,
        moreThanOneFrequency: 0.3,
        maxStacks: 12,
        minPerStack: 1,
        maxPerStack: 10,
        maxTotal: 50
    };

    function shuffle(a) {
        var j, x, i;

        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            x = a[i];
            a[i] = a[j];
            a[j] = x;
        }

        return a;
    }


    return {
        payout: 0,
        totalChipsCount: 0,
        totalStacksCount: 0,
        matrix: null,
        settings: {
            // FIXME copy pasted const...
            winningNumber: 5,
            winningNumber5frequency: 0.7,
            emptyBetFrequency: 0.4,
            moreThanOneFrequency: 0.3,
            maxStacks: 12,
            // TODO validate min < max
            minPerStack: 1,
            maxPerStack: 10,
            maxTotal: 10
        },
        currentHook: "roulette_payout",
        targetAnswer: null,
        switchPane: function( hook ) {
            var hooks = [
                "roulette_payout", "roulette_series", "blackjack_payout", "blackjack_count"
            ];

            if ( !hooks.includes(hook) ) {
                return;
            }

            var hookToPane = {
                roulette_payout: "tableframe",
                roulette_series: "seriesframe"
            }
            var pane = hookToPane[hook];

            var paneElem = this.$( hookToPane[this.currentHook] );
            paneElem.classList.add("hidden");

            paneElem = this.$(pane);
            paneElem.classList.remove("hidden");

            this.currentHook = hook;
            this["hook_" + hook]();
        },
        _get_series_controls: function() {
            return this.doc.getElementsByClassName("control-series");
        },
        hook_roulette_payout: function() {
            var controls = this._get_series_controls();

            for ( var i = 0; i < controls.length; i++ ) {
                controls[i].classList.add("invisible");
            }

            this.$("answer").setAttribute("placeholder", "");
        },
        hook_roulette_series: function() {
            var controls = this._get_series_controls();

            for ( var i = 0; i < controls.length; i++ ) {
                controls[i].classList.remove("invisible");
            }

            this.$("answer").setAttribute("placeholder", "Bet");
            this.$("answer").classList.add("preinput");
        },
        $: function(id, doc) {
            return this.doc.getElementById( id );
        },
        reset: function() {
            for (const prop in defaults) {
                this.settings[prop] = defaults[prop];
            }
        },
        refresh: function() {
            var answerInput = svgTable.$("answer");
            answerInput.classList.remove("error", "hinted");
            answerInput.classList.add("preinput");
            answerInput.value = '';
            this.payout = 0;
            this.totalStacksCount = 0;
            this.totalChipsCount = 0;
            this.settings.winningNumber = Math.random() > (1 - this.settings.winningNumber5frequency) ? 5 : 0;
            this.matrix = coords[this.settings.winningNumber];
            this.redraw();
        },
        redraw: function() {
            this.clearTable();
            this.highlightWinningNumber();
            this.generateBets();
            this.$("payout").textContent = this.payout.toString();
        },
        clearTable: function() {
            chips = this.$("chips")
            while (chips.firstChild) {
                chips.removeChild( chips.firstChild );
            }
        },
        highlightWinningNumber: function() {
            var num = this.settings.winningNumber;
            var winningElem;

            if ( num == 0 ) {
                winningElem = this.$("zeroFrame");
                this.$("number5frame").setAttribute("fill", "#b00");
            }
            else {
                winningElem = this.$("number5frame");
                this.$("zeroFrame").setAttribute("fill", "none");
            }

            winningElem.setAttribute("fill", "url(#winning" + num.toString() + "Gradient)");
        },
        generateBets: function() {
            var randomIndices = shuffle(
                Array.from( Array(this.matrix.length).keys() )
            );
            randomIndices.forEach( this.addRandomChips, this );

            if ( this.totalChipsCount == 0 ) {
                this.addChips( randomIndices[0] );
            }
        },
        addRandomChips: function( randomIndex ) {
            if ( Math.random() < this.settings.emptyBetFrequency ) {
                return;
            }

            if ( this.totalStacksCount < this.settings.maxStacks ) {
                this.addChips( randomIndex );
                this.totalStacksCount++;
            }
        },
        addChips: function( index ) {
            var count = 1;

            if (
                this.settings.maxPerStack > 1
                && Math.random() < this.settings.moreThanOneFrequency
            ) {
                count += Math.floor( Math.random() * (this.settings.maxPerStack-1) ) + 1;
            }


            var minFill = this.settings.minPerStack - count;

            if ( minFill > 0 ) {
                count += minFill;
            }


            var totalCountDiff = this.settings.maxTotal - this.totalChipsCount - count;

            if ( totalCountDiff < 0 ) {
                count += totalCountDiff;
            }


            if ( count > 0 ) {
                this.addChip( this.matrix[index], count );
                this.payout += count * multipliers[this.settings.winningNumber][index];
                this.totalChipsCount += count;
            }
        },
        addChip: function( chip, count ) {
            this.addSvgElem("circle", {
                cx: chip[0],
                cy: chip[1],
                r: 5.75,
                fill: "url(#chipGradient)",
                stroke: "brown",
                "stroke-width": 0.4
            });

            if ( count > 1 ) {
                this.addSvgElem("text", {
                    x: chip[0],
                    y: chip[1] + 2.75,
                    "text-anchor": "middle"
                }, count);
            }
        },
        addSvgElem: function( type, attrs, textContent ) {
            var elem = this.doc.createElementNS("http://www.w3.org/2000/svg", type);

            for (var attr in attrs) {
                elem.setAttribute(attr, attrs[attr]);
            }

            if ( textContent != null ) {
                elem.textContent = textContent;
            }

            this.$("chips").appendChild(elem);
        },
        checkAnswer_roulette_payout: function( answer ) {
            return answer == this.payout;
        },
        checkAnswer_roulette_series: function( answer ) {
            switch (this.targetAnswer.id) {
                case "answer":
                    return answer == series.current.bet;
                case "answer2":
                    return answer == series.current.totalBet;
                case "answer3":
                    return answer == series.current.rest;
            }

            return false;
        },
        correctAnswer_roulette_payout: function() {
            this.targetAnswer.classList.remove("error");
            this.targetAnswer.classList.remove("preinput");

            var that = this;
            setTimeout( function(){ that.refresh() }, 200 );
        },
        correctAnswer_roulette_series: function() {
            this.targetAnswer.classList.remove("error");
            this.targetAnswer.classList.remove("preinput");

            switch (this.targetAnswer.id) {
                case "answer":
                    this.targetAnswer = this.$("answer2");
                    break;
                case "answer2":
                    this.targetAnswer = this.$("answer3");
                    break;
                case "answer3":
                    this.targetAnswer = this.$("answer");
                    setTimeout( function(){ series.refresh() }, 200 );
                    break;
            }
        },
        checkAnswer: function() {
            var input = this.targetAnswer;
            var answer = input.value;

            if ( this["checkAnswer_" + this.currentHook](answer) ) {
                this["correctAnswer_" + this.currentHook]();
            }
            else {
                input.classList.add("error");
            }
        }
    };
})();


numpad = {
    clear: function() {
        svgTable.targetAnswer.value = "";
    },
    del: function() {
        var val = svgTable.targetAnswer.value;
        svgTable.targetAnswer.value = val.substr(0, val.length-1);
    },
    append: function(digit) {
        svgTable.targetAnswer.value = svgTable.targetAnswer.value + digit;
    },
    increment: function(inc = 1) {
        var val = Number.parseInt( svgTable.targetAnswer.value ) || 0;
        svgTable.targetAnswer.value = val + inc;
    },
    decrement: function(inc = 1) {
        var val = Number.parseInt( svgTable.targetAnswer.value ) || 0;
        val -= inc;

        if ( val < 1 ) {
            val = 1;
        }

        svgTable.targetAnswer.value = val;
    }
};


series = (function(){
    const seriesAvailable = ["tier", "orphelins", "vousins du zero", "0-spiel"];
    const seriesBet = {
        tier: 6,
        orphelins: 5,
        "vousins du zero": 9,
        "0-spiel": 4
    };

    return {
        settings: {
            selectedSeries: seriesAvailable.slice(),
            minBet: 100,
            maxBet: 500,
            step: 10
        },
        current: {
            series: null,
            money: null,
            bet: null,
            totalBet: null,
            rest: null
        },
        next: function() {
            var seriesIndex = Math.floor(Math.random() * this.settings.selectedSeries.length);
            this.current.series = this.settings.selectedSeries[ seriesIndex ];

            var coeff = seriesBet[ this.current.series ];
            var seriesMinimum = coeff * 5;
            var minBet = this.settings.minBet || seriesMinimum;

            // minBet + randomSteps <= maxBet
            var maxSteps = Math.floor((this.settings.maxBet - minBet)/this.settings.step) + 1;
            var randomSteps = this.settings.step * Math.floor(Math.random() * maxSteps);

            this.current.money = minBet + randomSteps;

            // how many 5s fit in money?
            this.current.bet = this.current.money / coeff;
            // get the highest multiple of 5s from the above number
            this.current.bet = Math.floor(this.current.bet / 5) * 5;
            this.current.totalBet = this.current.bet * coeff;
            this.current.rest = this.current.money - this.current.totalBet;
        },
        refresh: function() {
            this.next();
            this.redraw();
        },
        redraw: function() {
            svgTable.$("seriesName").textContent = this.current.series;
            svgTable.$("seriesMoney").textContent = this.current.money;
            // FIXME copy-paste
            svgTable.$("answer").classList.add("preinput");
            svgTable.$("answer2").classList.add("preinput");
            svgTable.$("answer3").classList.add("preinput");
            svgTable.$("answer").classList.remove("hinted");
            svgTable.$("answer2").classList.remove("hinted");
            svgTable.$("answer3").classList.remove("hinted");
            svgTable.$("answer").value = "";
            svgTable.$("answer2").value = "";
            svgTable.$("answer3").value = "";
        }
    };
})();


function attachEvents() {
    var modals = [
        "Menu", "About", "Shortcuts", "Settings", "SettingsSeries", "Result", "Awesome"
    ];

    modals.forEach( function(modalName){
        var modal = svgTable.$("modal" + modalName);
        var btn = svgTable.$("bt" + modalName);
        var span = svgTable.$("btClose" + modalName);

        btn.onclick = function() {
            modal.style.display = "block";
        };
        span.onclick =  function() {
            modal.style.display = "none";
        };
    } );


    var settings = [
        "winningNumber5frequency", "emptyBetFrequency", "moreThanOneFrequency", "maxStacks", "minPerStack", "maxPerStack", "maxTotal"
    ];

    settings.forEach( function(settingName){
        var input = svgTable.$("settings-" + settingName);
        var preview = svgTable.$("preview-" + settingName);

        input.value = svgTable.settings[settingName];

        if ( preview != null ) {
            input.oninput = function(ev) {
                preview.textContent = ev.target.value;
            }
        }

        input.onchange = function(ev) {
            svgTable.settings[settingName] = input.value;
        }
    } );


    var settingsSeries = [
        "minBet", "maxBet"
    ];

    // settingsSeries.forEach( function(settingName){
    // } );
    // TODO validate min < max
    // FIXME copy paste!
    (function(){
        var settingName = "minBet";

        function _setting_to_slider() {
            var val = series.settings[settingName];
            if (val === null) {
                return "-1";
            }
            else if (val == 50) {
                return "0";
            }
            else if (val > 2000) {
                return (20 + (val - 2000) / 1000).toString();
            }
            else {
                return (val / 100).toString();
            }
        }

        function _slider_to_setting(val) {
            if (val == "-1") {
                return null;
            }
            else if (val == "0") {
                return 50;
            }
            else if (Number.parseInt(val) > 20) {
                return 2000 + 1000 * (val % 20);
            }
            else {
                return Number.parseInt(val) * 100;
            }
        }

        var input = svgTable.$("settings-series-" + settingName);
        var preview = svgTable.$("preview-series-" + settingName);

        input.value = _setting_to_slider();

        if ( preview != null ) {
            input.oninput = function(ev) {
                var label = _slider_to_setting( ev.target.value );

                if ( label === null ) {
                    label = "series minimum";
                }
                else {
                    label = label.toString();
                }

                // TODO add thousand separator
                preview.textContent = label;
            }
        }

        input.onchange = function(ev) {
            series.settings[settingName] = _slider_to_setting( input.value );
        }
    })();

    // FIXME copy paste!
    (function(){
        var settingName = "maxBet";

        function _setting_to_slider() {
            var val = series.settings[settingName];
            if (val == 50) {
                return "0";
            }
            else if (val > 2000) {
                return (20 + (val - 2000) / 1000).toString();
            }
            else {
                return (val / 100).toString();
            }
        }

        function _slider_to_setting(val) {
            if (val == "0") {
                return 50;
            }
            else if (Number.parseInt(val) > 20) {
                return 2000 + 1000 * (val % 20);
            }
            else {
                return Number.parseInt(val) * 100;
            }
        }

        var input = svgTable.$("settings-series-" + settingName);
        var preview = svgTable.$("preview-series-" + settingName);

        input.value = _setting_to_slider();

        if ( preview != null ) {
            input.oninput = function(ev) {
                var label = _slider_to_setting( ev.target.value );
                preview.textContent = label.toString();
            }
        }

        input.onchange = function(ev) {
            series.settings[settingName] = _slider_to_setting( input.value );
        }
    })();

    // FIXME copy paste!
    (function(){
        var settingName = "step";
        var sliderValueMap = [5, 10, 25, 50, 100, 250, 500, 1000];

        function _setting_to_slider() {
            return sliderValueMap.indexOf( series.settings[settingName] ).toString();
        }

        function _slider_to_setting(val) {
            return sliderValueMap[ Number.parseInt(val) ];
        }

        var input = svgTable.$("settings-series-" + settingName);
        var preview = svgTable.$("preview-series-" + settingName);

        input.value = _setting_to_slider();

        if ( preview != null ) {
            input.oninput = function(ev) {
                var label = _slider_to_setting( ev.target.value );
                preview.textContent = label.toString();
            }
        }

        input.onchange = function(ev) {
            series.settings[settingName] = _slider_to_setting( input.value );
        }
    })();


    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(ev) {
        if ( ev.target.classList.contains("modal") ) {
            ev.target.style.display = "none";
        }
        svgTable.doc.activeElement.blur();
    }

    var modals = svgTable.doc.getElementsByClassName("modal");
    var isModalOpen = function() {
        for ( var i = 0; i < modals.length; i++ ) {
            if ( modals[i].style.display == "block" ) {
                return i;
            }
        }
        return -1;
    };


    attachSeriesToggleEvents();
    attachMenuHooks();


    var numkeys = svgTable.doc.getElementsByClassName("numkey");

    for ( var i = 0; i < numkeys.length; i++ ) {
        var numkey = numkeys[i];
        numkey.onclick = function( ev ) {
            numpad.append( ev.target.textContent );
        };
    }

    svgTable.$("btC").onclick = numpad.clear;
    svgTable.$("btDel").onclick = numpad.del;

    svgTable.$("btNPSettings").onclick = function() {
        var modal;

        switch ( svgTable.currentHook ) {
            case "roulette_payout":
                modal = svgTable.$("modalSettings");
                break;
            case "roulette_series":
                modal = svgTable.$("modalSettingsSeries");
                break;
        }

        modal.style.display = "block";
    };

    svgTable.$("btNPResult").onclick = function() {
        switch ( svgTable.currentHook ) {
            case "roulette_payout":
                svgTable.targetAnswer.value = svgTable.payout;
                svgTable.targetAnswer.classList.remove("error", "preinput");
                svgTable.targetAnswer.classList.add("hinted");
                break;
            case "roulette_series":
                // FIXME loop
                svgTable.$("answer").value = series.current.bet;
                svgTable.$("answer2").value = series.current.totalBet;
                svgTable.$("answer3").value = series.current.rest;
                svgTable.$("answer").classList.remove("error", "preinput");
                svgTable.$("answer2").classList.remove("error", "preinput");
                svgTable.$("answer3").classList.remove("error", "preinput");
                svgTable.$("answer").classList.add("hinted");
                svgTable.$("answer2").classList.add("hinted");
                svgTable.$("answer3").classList.add("hinted");

                // FIXME dont like it... so that only one click on answer is needed
                svgTable.targetAnswer = svgTable.$("answer3");
                break;
        }
    };


    window.onkeydown = function(ev) {
        var modalIndex = isModalOpen();

        if ( modalIndex >= 0 ) {
            if ( ev.key == "Escape" ) {
                modals[ modalIndex ].style.display = "none";
            }
        }
        else {
            switch ( ev.key ) {
                case "Enter":
                    svgTable.checkAnswer();
                    break;
                case " ":
                    refreshCurrentPane();
                    break;
                case "i":
                    modals.namedItem("modalAbout").style.display = "block";
                    break;
                case "s":
                    modals.namedItem("modalSettings").style.display = "block";
                    break;
                case "k":
                    modals.namedItem("modalShortcuts").style.display = "block";
                    break;
                case "c":
                    svgTable.switchPane("roulette_series");
                    break;
                case "p":
                    svgTable.switchPane("roulette_payout");
                    break;
                case "r":
                case "a":
                case "?":
                    modals.namedItem("modalResult").style.display = "block";
                    break;
                case "Delete":
                    numpad.clear();
                    break;
                case "Backspace":
                    numpad.del();
                    break;
                case "ArrowUp":
                    numpad.increment();
                    break;
                case "ArrowRight":
                    numpad.increment(10);
                    break;
                case "ArrowDown":
                    numpad.decrement();
                    break;
                case "ArrowLeft":
                    numpad.decrement(10);
                    break;
                default:
                    if ( !isNaN(Number.parseInt(ev.key)) ) {
                        numpad.append( ev.key );
                    }
            }
        }

        return true;
    }
}

function attachMenuHooks() {
    var menuItems = svgTable.$("modalMenu").getElementsByTagName("dd");

    for ( var i = 0; i < menuItems.length; i++ ) {
        var menuItem = menuItems[i];

        if ( menuItem.dataset.hasOwnProperty("hook") ) {
            menuItem.onclick = function( ev ) {
                var hook = ev.target.dataset.hook;

                svgTable.switchPane( hook );

                var modal = svgTable.$("modalMenu");
                modal.style.display = "none";
            };
        }
    }
}

function attachSeriesToggleEvents() {
    var checkboxes = svgTable.$("modalSettingsSeries").getElementsByClassName("toggle-series");

    for ( var i = 0; i < checkboxes.length; i++ ) {
        var checkbox = checkboxes[i];

        // revert after page soft reload
        checkbox.checked = true;

        checkbox.onchange = function( ev ) {
            var s = ev.target.labels[0].textContent;

            if ( ev.target.checked ) {
                series.settings.selectedSeries.push( s );
                ev.target.parentNode.classList.add("checked");
            }
            else {
                var i = series.settings.selectedSeries.indexOf( s );
                series.settings.selectedSeries.splice( i, 1 );
                ev.target.parentNode.classList.remove("checked");
            }
        }
    }
}

function refreshCurrentPane() {
    switch ( svgTable.currentHook ) {
        case "roulette_payout":
            svgTable.refresh();
            break;
        case "roulette_series":
            svgTable.targetAnswer = svgTable.$("answer");
            series.refresh();
            break;
    }
}

function init() {
    svgTable.doc = this.document;
    svgTable.reset();

    attachEvents();

    svgTable.refresh();
    svgTable.targetAnswer = svgTable.$("answer");

    series.refresh();
}
