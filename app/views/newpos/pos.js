
        //TO be removed once connected to views
        var ejs = require('ejs');
        var fs = require('fs');

        /* $(".keyboard").keyboard({
		    restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
		preventPaste : true,  // prevent ctrl-v and right click
		                            autoAccept : true
	   });
*/





       $('.keyboard').keyboard({
    // *** choose layout & positioning ***
    // choose from 'qwerty', 'alpha',
    // 'international', 'dvorak', 'num' or
    // 'custom' (to use the customLayout below)
    layout: 'qwerty',
    customLayout: {
        'default': [
            'd e f a u l t',
            '{meta1} {meta2} {accept} {cancel}'
            ],
        'meta1': [
            'm y m e t a 1',
            '{meta1} {meta2} {accept} {cancel}'
            ],
        'meta2': [
            'M Y M E T A 2',
            '{meta1} {meta2} {accept} {cancel}'
            ]
    },
    // Used by jQuery UI position utility
    position: {
        // null = attach to input/textarea;
        // use $(sel) to attach elsewhere
        of: null,
        my: 'center top',
        at: 'center top',
        // used when "usePreview" is false
        at2: 'center bottom'
    },

    // true: preview added above keyboard;
    // false: original input/textarea used
    usePreview: true,

    // if true, the keyboard will always be visible
    alwaysOpen: false,

	// give the preview initial focus when the keyboard
    // becomes visible
	initialFocus : true,

    // if true, keyboard will remain open even if
    // the input loses focus.
    stayOpen: false,

    // *** change keyboard language & look ***
    display: {
        'meta1' : '\u2666', // Diamond
        'meta2' : '\u2665', // Heart
        // check mark (accept)
        'a'     : '\u2714:Accept (Shift-Enter)',
        'accept': 'Accept:Accept (Shift-Enter)',
        'alt'   : 'AltGr:Alternate Graphemes',
        // Left arrow (same as &larr;)
        'b'     : '\u2190:Backspace',
        'bksp'  : 'Bksp:Backspace',
        // big X, close/cancel
        'c'     : '\u2716:Cancel (Esc)',
        'cancel': 'Cancel:Cancel (Esc)',
        // clear num pad
        'clear' : 'C:Clear',
        'combo' : '\u00f6:Toggle Combo Keys',
        // num pad decimal '.' (US) & ',' (EU)
        'dec'   : '.:Decimal',
        // down, then left arrow - enter symbol
        'e'     : '\u21b5:Enter',
        'enter' : 'Enter:Enter',
        // left arrow (move caret)
        'left'   : '\u2190',
        'lock'  : '\u21ea Lock:Caps Lock',
        'next'   : 'Next \u21e8',
        'prev'   : '\u21e6 Prev',
        // right arrow (move caret)
        'right'  : '\u2192',
        // thick hollow up arrow
        's'     : '\u21e7:Shift',
        'shift' : 'Shift:Shift',
        // +/- sign for num pad
        'sign'  : '\u00b1:Change Sign',
        'space' : ' :Space',
        // right arrow to bar
        // \u21b9 is the true tab symbol
        't'     : '\u21e5:Tab',
        'tab'   : '\u21e5 Tab:Tab'
    },

    // Message added to the key title while hovering,
    // if the mousewheel plugin exists
    wheelMessage: 'Use mousewheel to see other keys',

    css : {
        // input & preview
        input          : 'ui-widget-content ui-corner-all',
        // keyboard container
        container      : 'ui-widget-content ui-widget ui-corner-all ui-helper-clearfix',
        // default state
        buttonDefault  : 'ui-state-default ui-corner-all',
        // hovered button
        buttonHover    : 'ui-state-hover',
        // Action keys (e.g. Accept, Cancel, Tab, etc);
        // this replaces "actionClass" option
        buttonAction   : 'ui-state-active',
        // used when disabling the decimal button {dec}
        // when a decimal exists in the input area
        buttonDisabled : 'ui-state-disabled'
        },

    // *** Useability ***
    // Auto-accept content when clicking outside the
    // keyboard (popup will close)
    autoAccept: false,

    // Prevents direct input in the preview window when true
    lockInput: false,

    // Prevent keys not in the displayed keyboard from being
    // typed in
    restrictInput: false,

    // Check input against validate function, if valid the
    // accept button is clickable; if invalid, the accept
    // button is disabled.
    acceptValid  : true,

    // if acceptValid is true & the validate function returns
    // a false, this option will cancel a keyboard close only
    // after the accept button is pressed
	cancelClose  : true,

    // tab to go to next, shift-tab for previous
    // (default behavior)
    tabNavigation: false,

    // enter for next input; shift-enter accepts content &
    // goes to next shift + "enterMod" + enter ("enterMod"
    // is the alt as set below) will accept content and go
    // to previous in a textarea
    enterNavigation : false,
    // mod key options: 'ctrlKey', 'shiftKey', 'altKey',
    // 'metaKey' (MAC only)
    // alt-enter to go to previous;
    // shift-alt-enter to accept & go to previous
    enterMod : 'altKey',

    // if true, the next button will stop on the last
    // keyboard input/textarea; prev button stops at first
    // if false, the next button will wrap to target the
    // first input/textarea; prev will go to the last
	stopAtEnd : true,

    // Set this to append the keyboard immediately after the
    // input/textarea it is attached to. This option works
    // best when the input container doesn't have a set width
    // and when the "tabNavigation" option is true
    appendLocally: false,

    // If false, the shift key will remain active until the
    // next key is (mouse) clicked on; if true it will stay
    // active until pressed again
    stickyShift  : true,

    // Prevent pasting content into the area
    preventPaste: false,

	// caret places at the end of any text
	caretToEnd   : false,

    // Set the max number of characters allowed in the input,
    // setting it to false disables this option
    maxLength: false,

    // Mouse repeat delay - when clicking/touching a virtual
    // keyboard key, after this delay the key will start
    // repeating
    repeatDelay  : 500,

    // Mouse repeat rate - after the repeatDelay, this is the
    // rate (characters per second) at which the key is
    // repeated. Added to simulate holding down a real keyboard
    // key and having it repeat. I haven't calculated the upper
    // limit of this rate, but it is limited to how fast the
    // javascript can process the keys. And for me, in Firefox,
    // it's around 20.
    repeatRate   : 20,

    // resets the keyboard to the default keyset when visible
    resetDefault : false,

    // Event (namespaced) on the input to reveal the keyboard.
    // To disable it, just set it to ''.
    openOn: 'focus',

    // Event (namepaced) for when the character is added to the
    // input (clicking on the keyboard)
    keyBinding: 'mousedown',

    // combos (emulate dead keys)
    // if user inputs `a the script converts it to à,
    // ^o becomes ô, etc.
    useCombos: true,
    // if you add a new combo, you will need to update the
    // regex below
    combos: {
         // uncomment out the next line, then read the Combos
        //Regex section below
        // '<': { 3: '\u2665' }, // turn <3 into ♥ - change regex below
        'a': { e: "\u00e6" }, // ae ligature
        'A': { E: "\u00c6" },
        'o': { e: "\u0153" }, // oe ligature
        'O': { E: "\u0152" }
    },

    // *** Methods ***
    // Callbacks - attach a function to any of these
    // callbacks as desired
    initialized : function(e, keyboard, el) {},
    visible     : function(e, keyboard, el) {},
    change      : function(e, keyboard, el) {},
    beforeClose : function(e, keyboard, el, accepted) {},
    accepted    : function(e, keyboard, el) {},
    canceled    : function(e, keyboard, el) {},
    hidden      : function(e, keyboard, el) {},

    // called instead of base.switchInput
    // Go to next or prev inputs
    // goToNext = true, then go to next input;
    //   if false go to prev
    // isAccepted is from autoAccept option or
    //   true if user presses shift-enter
    switchInput : function(keyboard, goToNext, isAccepted) {},

    // this callback is called just before the "beforeClose"
    // to check the value if the value is valid, return true
    // and the keyboard will continue as it should (close if
    // not always open, etc)
    // if the value is not value, return false and the clear
    // the keyboard value ( like this
    // "keyboard.$preview.val('');" ), if desired
    validate    : function(keyboard, value, isClosing) { return true; }

})
    // activate the typing extension
.addTyping({
    showTyping : true,
    delay      : 50
});


























        /*BEGIN TEST HARNESS CODE*/
        /*Simple test harness to test out the POS main page before integratign the scanner and the EMV reader*/
        var inventory = [{
          "item_name" : "Item A",
          "inv_quantity" : 12,
          "cust_quantity" : 0,
          "price" : 6.99,
          "bar" : 1
        },
        {
          "item_name" : "Item B",
          "inv_quantity" : 12,
          "cust_quantity" : 0,
          "price" : 7.99,
          "bar" : 2
        },
        {
          "item_name" : "Item C",
          "inv_quantity" : 12,
          "cust_quantity" : 0,
          "price" : 8.99,
          "bar" : 3
        }];
        /*Item_list is the list of items the cusotmer has*/
        var item_list = [];
        /*Next 3 variables are self-explanatory. Just look at their name.*/
        var subtotal = 0.00;
        var tax = 0.00;
        var total = 0.00;
        /*Holds the id of the current item (id attribute assigned in the <tr> tage below). Is changed in one of the below functions*/
        var item_id = "";

        /*BEGIN SCAN CODE*/
        /*When the #scan_sim button is click carry out the following callback*/
        $("#scan_sim").click(function()  {
          /*Grab the barcode from the text area about*/
          var barcode = $("#barcode").val()
          /*Pass into  this function, which is defined below. See the function to know what it does.*/
          var i = determine_item_status(item_list, inventory, barcode);
          /*If the item in the list has a quantity of one then this means it is not present on the gui and must be put into the gui
          with the code below.*/
          if(item_list[i].cust_quantity == 1) {
            /*The item variable contains the html for the <tr> tag which displays our item in the gui. We give this tag an id of "itemx"
            where x represents where the item is in the "item_list" variable above. We then go to that place in the list and list out the key
            values as the text values of the td tags.*/
            var item = "<tr class=\"whole-item animated bounceInUp\" id=\"item" + i.toString() + "\"> \
            <td class=\"eq-cells name\">" + item_list[i].item_name + "</td> \
            <td class=\"eq-cells price\">$" + item_list[i].price + "<td> \
            <td id=\"qnt-item-" + i + "\"class=\"eq-cells quantity\">" + item_list[i].cust_quantity + "<td> \
            </tr>";
            /*Append to the table that holds the items*/
            $("#sale_list tbody").append(item);
          }
          /*If the item is in the list then just go to its place and increment its counter and update the gui*/
          else {
            var item_id = "qnt-item-" + i;
            $("#" + item_id).text(item_list[i].cust_quantity);
          }
          /*Update the global quantities of subtotal, tax, and total*/
          subtotal+=item_list[i].price;
          $("#subtotal").text("$" + subtotal.toString());
          tax = subtotal * .075;
          $("#tax").text("$"+tax.toString());
          total = subtotal + tax;
          $("#total").text("$"+total.toString());
        });
        /*This function merely searches the inventory by barcode to see if it exists. If so then see if the item is already
        in the customers list. If so the increment the counter and if not then add to list.
        @return: index of the item in the item_list
        @param: item_list, inventory, and barcode*/
        function determine_item_status(item_list, inventory, barcode) {
          var i = -1;
          /*Check the inventory by bar code(which as we wrote right now has two entries) and store the result*/
          var inv_result = inventory.find(function(e) {
            return e.bar == barcode;
          });
          /*If it's in the inventory go here*/
          if(inv_result != undefined) {
            /*Check the customers current list to see if they already have it in their choices*/
            //console.log("In inventory");
            var flag = 0;
            cus_result = item_list.find(function(e) {
              /*This i will keep track of where it is in the list*/
              i++;
              return e.bar == barcode;
            });
            /*If the customer already has one then just increment the quantity counter*/
            if(cus_result != undefined) {
              item_list[i].cust_quantity+=1;
            }
            /*If not then increment the counter to one and add to the customer's list called item_list*/
            else {
              inv_result.cust_quantity = 1;
              item_list.push(inv_result);
              i = item_list.length - 1;
            }
            /*return the place of the item in the list for future use*/
            return i;
          }
          else {
            return "Not in inventory";
          }
        };



        /*BEGIN DELETE CODE*/
        /*When a finger is on the screen and on an item record the start point.
        This is how far away the finger is from the left border.*/
        $(document).on("touchstart", ".whole-item", function(e) {
          var touchobj = e.changedTouches[0].clientX;
          touchstart = touchobj;

        });

        /*When the finger leaves the screen record it's end point in pixels.*/
        $(document).on("touchend", ".whole-item", function(e) {
          var touchobj = e.changedTouches[0].clientX;
          touchend = touchobj;
          /*Before seeing if this is a valid swipe take note of the item_id for future use*/
          item_id = $(this).attr("id");
          /*A valid swipe is if the pixel difference from the start to end is 100 pixels. If a valid swipe then bring up the delete confirm modal.*/
          if(touchstart-touchend >= 100) {
            /*Populates the modal with the item name for seller confirmation*/
            if($("#" + item_id + " .quantity").text() == "1") {
              $('#item_type').text($("#" + item_id + " .name").text());
            }
            else {
              /*If there are multiple items to be deleted as how many  an create a form to input the amount*/
              $('#item_type').text("how many of " + $("#" + item_id + " .name").text());
              var quantity_form = "<div id=\"delete-form\" class=\"row\"> \
              <div class=\"input-field col s6\"> \
              <input value=\"1\" id=\"delete-quantity\" type=\"text\" class=\"validate\"> \
              <label class=\"active\" for=\"first_name2\">Quantity (1 minimum, " + $("#" + item_id + " .quantity").text() + " maximum)</label>\
              </div>\
              </div>";
              $("#delete_option").append(quantity_form);
            }
            /*Open modal*/
            $('#modal1').openModal();
          }
        });

        /*Corresponds to a button on the modal. If this button is pressed then deleting is confirmed. All deleting is handled here.*/
        $("#y_delete").click(function() {
          var i = -1;
          /*Find the item by name in the list of customer items named "item_list"*/
          var item_name = $("#" + item_id + " .name").text();
          item_list.find(function(e) {
          /*This i will keep track of where it is in the list*/
            i++;
            return e.item_name == item_name;
          });
          /*Handles deletions of items if the quantity is 1*/
          if($("#" + item_id + " .quantity").text() == "1") {
            /*Do any pricing updates before deleting*/
            subtotal-= item_list[i].price;
            tax = subtotal * .075;
            total = subtotal + tax;
            /*Remove that item from the list*/
            item_list.splice(i, 1);
            /*Remove the item from the gui*/
            $("#"+item_id).remove()
          }/*If not more than one then this branch handles deletions if more than one*/
          else {
            /*Grabs the specified amount to be deleted*/
            var delete_amount = $("#delete-quantity").val();
            /*Do any pricing updates before deleting (can write into a function honestly)*/
            subtotal-=(item_list[i].price * delete_amount);
            tax = subtotal * .075;
            total = subtotal + tax;
            /*Do the deletions as long as the specified amount is between 1-(max item #)*/
            if(delete_amount >= 1 && delete_amount <= Number($("#" + item_id + " .quantity").text())) {
              item_list[i].cust_quantity-=delete_amount;
            }
            /*If the user deletes all items in then remove that item from the user list and the gui*/
            if(item_list[i].cust_quantity == 0) {
              /*Remove that item from the list*/
              item_list.splice(i, 1);
              /*Remove the item from the gui*/
              $("#"+item_id).remove()
            }
            else
              $("#item" + i + " .quantity").text(item_list[i].cust_quantity.toString());
            console.log(delete_amount);
            $("#delete-form").remove();
          }
          if(item_list.length == 0) {
            subtotal = 0;
            tax = 0;
            total = 0;
          }
          $("#subtotal").text("$" + subtotal.toString());
          $("#tax").text("$"+tax.toString());
          $("#total").text("$"+total.toString());
        });

        $("#n_delete").click(function() {
          console.log(item_id)
          var i = -1;
          var item_name = $("#" + item_id + " .name").text();
          if($("#" + item_id + " .quantity").text() >= "1") {
            $("#delete-form").remove();
          }

        });
        /*BEGIN SEARCH INVENTORY CODE*/
        $("#search").change(function() {

        });

        /*BEGIN CANCEL ORDER CODE*/
        $("#cancel").click(function() {
          /*Open modal*/
          $('#modal2').openModal();
        });

        $("#y_cancel").click(void_order);

        function void_order() {
          if(item_list.length != 0) {
            item_list.splice(0, item_list.length);
            $("#sale_list tbody").empty();
            subtotal = 0;
            tax = 0;
            total = 0;
            $("#subtotal").text("$" + subtotal.toString());
            $("#tax").text("$"+tax.toString());
            $("#total").text("$"+total.toString());
          }
        }
        /*BEGIN CONFIRM ORDER CODE*/
        /*MAY NEED TO BE IN ITS ONW FILE AND DIRECToRY*/
        /*Instead of just appending elements to another element I used ejs to render elements from a different file for a nicer look. We can change this though*/
        $("#confirm").click(function() {
          if(item_list.length != 0)
            $('#pos_menu').html(ejs.render(fs.readFileSync( __dirname + '/pay_choice.html', 'utf-8') , {}));
        });

        $(document).on("click", "#cash", function() {
          $('#pos_menu').html(ejs.render(fs.readFileSync( __dirname + '/cash.html', 'utf-8') , {}));
        });

        $(document).on("click", "#card", function() {
          console.log("Card");
        });

        $(document).on("click", "#c_and_c", function() {
          console.log("Cash and card");
        });

        $(document).on("click", "#m_card", function() {
          console.log("Multi card");
        });
        /*BEGIN CASH TRANSACTION CODE (can be put into cash.html if wanted)*/
        $(document).on("change", "#tendered", function() {
          console.log($(this).val());
          $("#change").val("$" + (Number($(this).val()) - total))
        });

        /*BEGIN COMPLETE ORDER CODE*/
        $(document).on("click", "#complete",function() {
          $('#pos_menu').html(ejs.render(fs.readFileSync( __dirname + '/completed.html', 'utf-8') , {}));
          setTimeout(fade_out, 1500);
          void_order();
        });
        function fade_out() {
          $("#thanks").addClass("fadeOut");
        }
