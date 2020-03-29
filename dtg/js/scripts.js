svgTable = (function(){
    const coords = {
        5: [
            [75, 12], [87.5, 12], [100, 12],
            [75, 43], [87.5, 43], [100, 43],
            [75, 58.5], [87.5, 58.5], [100, 58.5],
            [75, 74], [87.5, 74], [100, 74]
        ],
        0: [
            [50, 12],
            [50, 27.5],
            [50, 43],
            [37.5, 58.5], [50, 58.5],
            [50, 74],
            [50, 89.5]
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
        matrix: null,
        settings: {
            // FIXME copy pasted const...
            winningNumber: 5,
            winningNumber5frequency: 0.7,
            emptyBetFrequency: 0.4,
            moreThanOneFrequency: 0.3,
            maxPerStack: 10,
            maxTotal: 10
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
            answerInput.classList.remove("error");
            answerInput.value = '';
            answerInput.select();
            this.payout = 0;
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

            this.addChips( randomIndex );
        },
        addChips: function( index ) {
            var count = 1;

            if (
                this.settings.maxPerStack > 1
                && Math.random() < this.settings.moreThanOneFrequency
            ) {
                count += Math.floor( Math.random() * (this.settings.maxPerStack-1) ) + 1;
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
                r: 5,
                fill: "url(#chipGradient)",
                stroke: "brown",
                "stroke-width": 0.4
            });

            if ( count > 1 ) {
                this.addSvgElem("text", {
                    x: chip[0],
                    y: chip[1] + 2,
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
        checkAnswer: function() {
            var input = this.$("answer");
            var answer = input.value;

            if (answer == this.payout) {
                this.refresh();
            }
            else {
                input.classList.add("error");
            }
        }
    };
})();

function attachEvents() {
    var modals = [
        "About", "Shortcuts", "Settings", "Result", "Awesome"
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
        "winningNumber5frequency", "emptyBetFrequency", "moreThanOneFrequency", "maxPerStack", "maxTotal"
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


    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(ev) {
        if ( ev.target.classList.contains("modal") ) {
            ev.target.style.display = "none";
        }
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

    window.onkeydown = function(ev) {
        var modalIndex = isModalOpen();
        var captureInput = true;

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
                    svgTable.refresh();
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
                case "p":
                case "r":
                case "a":
                case "?":
                    modals.namedItem("modalResult").style.display = "block";
                    break;
                default:
                    var allowedKeys = ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "Delete", "Backspace", "F5", "Home", "End" ];
                    if ( !isNaN(ev.key) || allowedKeys.includes(ev.key) ) {
                        captureInput = false;
                    }
            }
        }

        return !captureInput;
    }
}

function init() {
    svgTable.doc = this.document;
    svgTable.reset();

    attachEvents();

    svgTable.refresh();
}
