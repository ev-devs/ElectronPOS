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

$(".keyboard").keyboard();
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
    var item = "<tr style=\"width:inherit;\" class=\"whole-item animated bounceInUp\" id=\"item" + i.toString() + "\"> \
    <td class=\"eq-cells name\">" + item_list[i].item_name + "</td> \
    <td class=\"eq-cells price\">$" + item_list[i].price + "</td> \
    <td id=\"qnt-item-" + i + "\"class=\"eq-cells quantity\">" + item_list[i].cust_quantity + "</td> \
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

$("#y_cancel").click(function() {
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
});

/*BEGIN CONFIRM ORDER CODE*/
/*MAY NEED TO BE IN ITS ONW FILE AND DIRECToRY*/
/*Instead of just appending elements to another element I used ejs to render elements from a different file for a nicer look. We can change this though*/
$("#confirm").click(function() {
  if(item_list.length != 0)
    $('#pos_menu').html(ejs.render(fs.readFileSync( __dirname + '/pay_choice.html', 'utf-8') , {}));
});

$(document).on("click", "#cash", function () {
  $('#pos_menu').html(ejs.render(fs.readFileSync( __dirname + '/cash.html', 'utf-8') , {}));
});

$(document).on("click", "#card", function () {
  console.log("Card");
});

$(document).on("click", "#c_and_c", function () {
  console.log("Cash and card");
});

$(document).on("click", "#m_card", function () {
  console.log("Multi card");
});
