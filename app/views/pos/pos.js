/*

tl;dr This contains all the logic for the pos.html view

file name   : pos.js
full path   : app/views/pos/pos.js
purpose     : manipulate the POS GUI when scanning items
              as well as communication with the EMV reader (to charge client)
present in  : pos.html

*/





//TO be removed once connected to views
var ejs = require('ejs');
var fs = require('fs');
document.addEventListener('refocus', function(e) {
  $("#barcode").focus();
})
function refocus() {
  var event = new CustomEvent('refocus');
  document.dispatchEvent(event);
}
refocus();
$(".keyboard").keyboard({
  restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
  preventPaste : true,  // prevent ctrl-v and right click
  autoAccept : true,
  layout: "num"
});
/*BEGIN TEST HARNESS CODE*/
/*Simple test harness to test out the POS main page before integratign the scanner and the EMV reader*/
var inventory = [{
  "item_name" : "7 steps to success by Alexander Hamitlton",
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
},
{
  "item_name" : "Item D",
  "inv_quantity" : 12,
  "cust_quantity" : 0,
  "price" : 9.99,
  "bar" : 4
},
{
  "item_name" : "Item E",
  "inv_quantity" : 12,
  "cust_quantity" : 0,
  "price" : 10.99,
  "bar" : 5
},{
  "item_name" : "Item F",
  "inv_quantity" : 12,
  "cust_quantity" : 0,
  "price" : 11.99,
  "bar" : 6
},
{
  "item_name" : "Item G",
  "inv_quantity" : 12,
  "cust_quantity" : 0,
  "price" : 12.99,
  "bar" : 7
},
{
  "item_name" : "Item H",
  "inv_quantity" : 12,
  "cust_quantity" : 0,
  "price" : 13.99,
  "bar" : 8
}

];
/*Item_list is the list of items the cusotmer has*/
var item_list = [];
/*Next 3 variables are self-explanatory. Just look at their name.*/
var subtotal = 0.00;
var tax = 0.00;
var total = 0.00;
/*Holds the id of the current item (id attribute assigned in the <tr> tage below). Is changed in one of the below functions*/
var item_id = "";
var item_num = 0;

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
    /*var item = "<tr class=\"whole-item animated bounceInUp\" id=\"item" + i.toString() + "\"> \
    <td class=\"eq-cells name\">" + item_list[i].item_name + "</td> \
    <td class=\"eq-cells price\">$" + item_list[i].price + "</td> \
    <td id=\"qnt-item-" + i + "\"class=\"eq-cells quantity\">" + item_list[i].cust_quantity + "</td> \
    </tr>"; */
    var item = "<tr class=\"whole-item animated fadeIn\" id=\"item" + i.toString() + "\"> \
     <td class=\"eq-cells name \" style=\"width: 76%;\">x" + item_list[i].cust_quantity.toString() + ": " + item_list[i].item_name + "</td> \
     <td class=\"eq-cells price\" style=\"width: 24%; border-left: 1px solid #ddd;\">$" + item_list[i].price + "</td> \
    </tr>"
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
  $("#barcode").focus();
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
  var touchobj = e.originalEvent.changedTouches[0].clientX;
  touchstart = touchobj;
});

/*When the finger leaves the screen record it's end point in pixels.*/
$(document).on("touchend", ".whole-item", function(e) {
  var touchobj = e.originalEvent.changedTouches[0].clientX;
  touchend = touchobj;
  console.log("***BEGIN DELETE***")
  /*Before seeing if this is a valid swipe take note of the item_id for future use*/
  item_id = $(this).attr("id").toString();
  item_num = Number(item_id.substring(4, item_id.length));
  console.log("Item id: " + item_id);
  /*A valid swipe is if the pixel difference from the start to end is 100 pixels. If a valid swipe then bring up the delete confirm modal.*/
  if(touchstart-touchend >= 100) {
    /*Populates the modal with the item name for seller confirmation*/
    $(this).css("background-color", "red");
    if($("#" + item_id + " .quantity").text() == "1") {
      $('#item_type').text($("#" + item_id + " .name").text());
    }
    else {
      /*If there are multiple items to be deleted as how many  an create a form to input the amount*/
      $('#delete_option').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/delete_form.html', 'utf-8') , {'max' : $("#" + item_id + " .quantity").text()}));
      $('#item_type').text("how many of " + $("#" + item_id + " .name").text());
    }
    /*Open modal*/
    $('#modal1').openModal({
      dismissible: false, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
    });
  }
});

/*Corresponds to a button on the modal. If this button is pressed then deleting is confirmed. All deleting is handled here.*/
$("#y_delete").click(function() {
  var i = -1;console.log("item location: " + i);
  /*Find the item by name in the list of customer items named "item_list"*/
  var item_name = $("#" + item_id + " .name").text();
  console.log("Item name: " + item_name);
  /*This i will keep track of where it is in the list*/
  item_list.find(function(e) {
    i++;
    return e.item_name == item_name;
  });
  console.log("Item location: " + i);
  /*Handles deletions of items if the quantity is 1*/
  if($("#" + item_id + " .quantity").text() == "1") {
    /*Do any pricing updates before deleting*/
    subtotal-= item_list[i].price;
    tax = subtotal * .075;
    total = subtotal + tax;
    /*Remove that item from the list*/
    item_list.splice(i, 1);
    /*Remove the item from the gui*/
    $("#" + item_id).remove()
  }/*If more than one then this branch handles deletions if more than one*/
  else {
    /*Grabs the specified amount to be deleted*/
    var delete_amount = Number($("#delete-quantity").val());
    /*Do the deletions as long as the specified amount is between 1-(max item #)*/
    if(delete_amount >= 1 && delete_amount <= Number($("#" + item_id + " .quantity").text())) {
      /*Do any pricing updates before deleting (can write into a function honestly)*/
      subtotal-=(item_list[i].price * delete_amount);
      tax = subtotal * .075;
      total = subtotal + tax;
      /*Delete amount specified*/
      item_list[i].cust_quantity-=delete_amount;
    }
    /*If the user deletes all items in then remove that item from the user list and the gui*/
    if(item_list[i].cust_quantity <= 0) {
      /*Remove that item from the list*/
      item_list.splice(i, 1);
      /*Remove the item from the gui*/
      $("#" + item_id).remove()
    }
    else
      $("#item" + i + " .quantity").text(item_list[i].cust_quantity.toString());
    console.log(item_list);
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
  $("#item" + i).removeAttr("style");
  refocus();
});

$("#n_delete").click(function() {
  console.log("No");
  var item_name = $("#" + item_id + " .name").text();
  if($("#" + item_id + " .quantity").text() >= "1") {
    $("#delete-form").remove();
    $("#item" + item_num).removeAttr("style");
  }
  //$("#item" + item_num).removeAttr("style");
  refocus();
});
/*BEGIN SEARCH INVENTORY CODE*/
$("#search").change(function() {
  console.log("Changed");
});

/*BEGIN CANCEL ORDER CODE*/
$("#cancel").click(function() {
  /*Open modal*/
  if(item_list.length > 0)
    $('#modal2').openModal();
});

$("#y_cancel").click(function() {
  if(item_list.length != 0) {
    item_list.splice(0, item_list.length);
    $("#sale_list tbody").empty();
    void_order();
    $("#subtotal").text("$" + subtotal.toString());
    $("#tax").text("$"+tax.toString());
    $("#total").text("$"+total.toString());
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/completed.html', 'utf-8') , {}));
    setTimeout(fade_out, 1500);
    confirm_flag = 0;
    cash_flag = 0;
    card_flag = 0;
    refocus();
  }
});

$("#n_cancel").click(function() {
  refocus()
});

/*BEGIN CONFIRM ORDER CODE*/
/*MAY NEED TO BE IN ITS ONW FILE AND DIRECToRY*/
/*Instead of just appending elements to another element I used ejs to render elements from a different file for a nicer look. We can change this though*/
var confirm_flag = 0;
var card_flag = 0;
var cash_flag = 0;
var swiped = 0;
$("#confirm").click(function() {
  if(confirm_flag == 0) {
    if(item_list.length != 0) {
      if(confirm_flag == 0) {
        $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/pay_choice.html', 'utf-8') , {}));
        confirm_flag = 1;
      }
    }
  }
  /*BEGIN  INTERNAL COMPLETE ORDER CODE*/
  if(cash_flag == 1) {
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/completed.html', 'utf-8') , {}));
    setTimeout(fade_out, 1500);
    console.log("here is there");
    void_order();
    $("#cancel").removeAttr("style");
    $("#confirm").removeAttr("style");
    confirm_flag = 0;
    cash_flag = 0;
  }
});

$(document).on("click", "#cash", function () {
  cash_flag = 1;
  $("#cancel").css("background-color", "red");
  $("#confirm").css("background-color", "green");
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/cash.html', 'utf-8') , {}));
});

$(document).on("click", "#card", function () {
  card_flag = 1;
  $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/card.html', 'utf-8') , {}));
  setTimeout(fade_out, 1500);
});

$(document).on("click", "#c_and_c", function () {
  console.log("Cash and card");
});

$(document).on("click", "#m_card", function () {
  console.log("Multi card");
});

/*BEGIN CASH TRANSACTION CODE (can be put into cash.html if wanted)*/
$(document).on("change", "#tendered", function() {
  console.log($(this).val());
  if($(this).val() >= total)
    $("#change").text("$" + (Number($(this).val()) - total))
});
/*BEGIN CARD TRANSACTION CODE*/
$(document).on("click", "#swipe_sim", function() {
  if(card_flag)
    $('#right-middle').html(ejs.render(fs.readFileSync( __dirname + '/pay_options/process.html', 'utf-8') , {}));
});

function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
}

function void_order() {
  ///if(item_list.length != 0) {
    item_list.splice(0, item_list.length);
    $("#sale_list tbody").empty();
    subtotal = 0;
    tax = 0;
    total = 0;
    $("#subtotal").text("$" + subtotal.toString());
    $("#tax").text("$"+tax.toString());
    $("#total").text("$"+total.toString());
  //}
}


/*
Text size, scroll bottom. Touch screen acting like a mouse must make itthink like touch screen
BUG: Item is negative with multiple items. weird stuff going on. Bug with the red color, probably with item_num, will needto get rid
Quantity right side of item, icon on left
Right side is for platinum view as well before any transactions
Switch between platinums
*/

/*BEGIN PLATINUMS CODE*/
var Platinums_list=[{  //temporary list used for testing
	"first_name" : "Kevin",
	"last_name" : "Ortega"
},
{
	"first_name": "Harold and Hannah",
	"last_name": "Yates"
},
{
	"first_name": "Jay and Jasmine",
	"last_name":" Witiker"
},
{
	"first_name": "Stephen and Tiana",
	"last_name":" Castro"
},
{
	"first_name": "Bob and Bertha",
	"last_name":" Vallero"
},
{
	"first_name": "Martin and Luz",
	"last_name":" Ameral"
},
{
	"first_name": "Marcos and Maria",
	"last_name":" Ruiz"
},
{
	"first_name": "Miguel and Paula",
	"last_name":" Rubio"
},
{
	"first_name": "Juan and Juanita",
	"last_name":" Lopez"
},
{
	"first_name": "Jacob",
	"last_name":" Jicklesmith"
},
{
	"first_name": "John and Mary",
	"last_name":" Doe"
},
];


 /*Append to container holds the names of platinums*/
(function selectPlatinum(){
	 for(var i = 0; i < Platinums_list.length; i++){
		 var name = "<a href=\"#!\" class=\"collection-item\">" + Platinums_list[i].first_name.toString()  + " " + Platinums_list[i].last_name.toString()+ "</a>";
		 $("#platinums-list").append(name);
	}
})()
