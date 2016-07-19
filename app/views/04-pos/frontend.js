document.addEventListener('refocus', function(e) {
  $("#barcode").focus();
})
function refocus() {
  var event = new CustomEvent('refocus');
  document.dispatchEvent(event);
}

$(".keyboard").keyboard({
  restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
  preventPaste : true,  // prevent ctrl-v and right click
  autoAccept : true,
  layout: "num"
});
/*1, H0187, H0192*/
/*Item_list is the list of items the cusotmer has*/
var item_list = [];
/*Next 3 variables are self-explanatory. Just look at their name.*/
var subtotal = 0.00;
var tax = 0.00;
var total = 0.00;
/*Holds the id of the current item (id attribute assigned in the <tr> tage below). Is changed in one of the below functions*/
var item_id = "NONE";
var item_num = 0;
var current_platinum = "NONE";
/*BEGIN SCAN CODE*/
/*When the #scan_sim button is click carry out the following callback*/
$("#scan_sim").click(function()  {
  /*Grab the barcode from the text area about*/
  var barcode = $("#barcode").val();
  /*Pass into  this function, which is defined below. See the function to know what it does.*/
  var i;
  var places = [];
  if(current_platinum != "NONE")
    places = determine_item_status(item_list, inventory, barcode);
  i = places[1];
  /*If the item in the list has a quantity of one then this means it is not present on the gui and must be put into the gui
  with the code below.*/
  if(i != -1 && current_platinum != "NONE") {
    if(item_list[i].cust_quantity == 1) {
      /*The item variable contains the html for the <tr> tag which displays our item in the gui. We give this tag an id of "itemx"
      where x represents where the item is in the "item_list" variable above. We then go to that place in the list and list out the key
      values as the text values of the td tags.*/
      var item = "<tr class=\"whole-item animated fadeIn\" id=\"item" + i.toString() + "\"> \
       <td class=\"eq-cells name \" style=\"width: 77%;\"><span class=\"truncate\" id=\"inv-item" + places[0]/*item_list[i].title.replace(/ /g, "_")*/ + "\">\
       x" + item_list[i].cust_quantity + ": " + item_list[i].title + "</span></td> \
       <td class=\"eq-cells price\" style=\"width: 23%; border-left: 1px solid #ddd;\">$" + item_list[i].price + "</td> \
      </tr>"
      /*Append to the table that holds the items*/
      $("#sale_list tbody").append(item);
    }
    /*If the item is in the list then just go to its place and increment its counter and update the gui*/
    else {
			//var item = $("#" + item_list[i].title.replace(/ /g, "_")).text().trim().toString();
      var item = $("#inv-item" + places[0]).text().trim();
			console.log(item)
      var qnt = item.substring(item.indexOf("x") + 1, item.indexOf(": "));
      item = item.replace(qnt.toString(), item_list[i].cust_quantity.toString());
      $("#inv-item" + places[0]).text(item);
    }
		cancel_flag = 1;
    /*Update the global quantities of subtotal, tax, and total*/
    subtotal+=item_list[i].price;
    $("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",").toString());
    tax = subtotal * .075;
    $("#tax").text("$" + accounting.formatNumber(tax, 2, ",").toString());
    total = subtotal + tax;
    $("#total").text("$" + accounting.formatNumber(total, 2, ",").toString());
  }
  $("#barcode").focus();
});

/*Corresponds to a button on the modal. If this button is pressed then deleting is confirmed. All deleting is handled here.*/
$("#y_delete").click(function() {
  var i = -1;
  /*Find the item by name in the list of customer items named "item_list"*/
	console.log(item_id);
	/*Grab the item info by id and using the find function to find the element in the id*/
  var item = $("#" + item_id).find("span").text().trim();
	/*Gte the quantity of items*/
  var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
	/*Get the item name*/
  var item_name = item.substring(item.indexOf(": ") + 2, item.length);
  item_list.find(function(e) {
    /*This i will keep track of where it is in the list*/
    i++;
    return e.title == item_name;
  });
	/*If the cust_quantity value is one*/
  if(item_list[i].cust_quantity == 1) {
		/*Do price updates*/
    subtotal-= item_list[i].price;
    tax = subtotal * .075;
    total = subtotal + tax;
		/*Make cust_quantity 0*/
    item_list[i].cust_quantity = 0;
		/*Remove from gui and item_list*/
    $("#" + item_id).remove();
    item_list.splice(i, 1);
  }
	/*If the cust_quantity value is greater than one*/
  else if(item_list[i].cust_quantity > 1) {
		/*Gran the value to be deleted*/
    var delete_quantity = $("#delete-quantity").val();
    /*Do any pricing updates before deleting (can write into a function honestly)*/
    subtotal-=(item_list[i].price * delete_quantity);
    tax = subtotal * .075;
    total = subtotal + tax;
		/*If the quantity of items to be deleted is less than than the current quantity*/
    if(delete_quantity < item_qnt) {
      item_list[i].cust_quantity-=delete_quantity;
			/*In the item info replace the old quantity with the new quantity*/
      item = item.replace(item_qnt.toString(), item_list[i].cust_quantity.toString());
			/*Take the title of the item and replace all the spaces with underscores because thats how the id is*/
      $("#" + item_list[i].title.replace(/ /g, "_")).text(item);
    }
		/*If the quantity to delete matches the current quantity available*/
    else if(delete_quantity == item_qnt) {
			/*Make tthe cust_quantity value 0*/
      item_list[i].cust_quantity = 0;
			/*Removet hat item from the gui*/
      $("#" + item_id).remove();
			/*Remove that item from the item_list*/
      item_list.splice(i, 1);
    }
		/*Remove the form from the modal*/
		$("#delete-form").remove();
  }
	/*If the there aren't any items after deletion then there is nothing to cancel so lower the flag*/
	if(item_list.length == 0)
		cancel_flag = 0;
	/*Updates the subtotal in the gui with the accounting package*/
  $("#subtotal").text("$" + accounting.formatNumber(subtotal, 2, ",").toString());
	/*Updates the tax in the gui with the accounting package*/
  $("#tax").text("$" + accounting.formatNumber(tax, 2, ",").toString());
	/*Updates the total in the gui with the accounting package*/
  $("#total").text("$" + accounting.formatNumber(total, 2, ",").toString());
	/*Removes the red from the item*/
	$("#" + item_id).removeAttr("style");
	/*Refocuses the page on the barcode input*/
  refocus();
});

$("#n_delete").click(function() {
  /*Grab the item name*/
  var item = $("#qnt-item-"+ item_num).text().trim().toString();
	/*Grab the number of items*/
  var item_qnt = Number(item.substring(item.indexOf("x") + 1, item.indexOf(": ")));
	/*If there are more than one items do this*/
  if(item_qnt >= "1") {
		/*Remove the form from the modal*/
    $("#delete-form").remove();
  }
	/*Removes the red from the item*/
	$("#" + item_num).removeAttr("style");
	/*Refocuses the page on the barcode input*/
  refocus();
});

/*BEGIN SEARCH INVENTORY CODE*/
$("#search").change(function() {
  console.log("Changed");
});

/*BEGIN CANCEL ORDER CODE*/
$("#cancel").click(function() {
  /*Open modal as long as there are items to cancel and the cancel flag is raised*/
  if(item_list.length > 0 && cancel_flag == 1)
    $('#modal2').openModal();
});

/*If the button is pressed to not cancel the order then refocus the page on the barcode input*/
$("#n_cancel").click(function() {
  refocus()
});

/*NOTE: BEGIN CASH TRANSACTION CODE (can be put into cash.html if wanted)*/ /*MAY NEED TO GO IN BACKEND.JS*/
$(document).on("change", "#tendered", function() {
  if($(this).val() >= total) {
    var change = $(this).val() - accounting.formatNumber(total, 2, ",");
    $("#change").text("$" + accounting.formatNumber(change, 2, ","));
  }
});

/*A function that fades out the html element with id "thanks". USed in the "completed.html" file.*/
function fade_out() {
  $("#thanks").addClass("fadeOut");
  refocus();
	/*Render platinums list FIX*/
}
