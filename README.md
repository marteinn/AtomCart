AtomCart
=============

This is a shopping cart in its purest form (as an atom - hence the name), built in javascript with jQuery as a base, in the form of a plugin. It does nothing else except hold a very lightweight interface shopping cart, that supports adding/removing cart items and basic sum calculations.


Getting started
-------

First you need to select which element you want to base your cart upon (a div element works great), and thereafter run atomCart (through jQuery of course).

	$("#cartelement").atomCart();
  


AtomCart can also run several different instances as once, just pick your element and run it.

	$("#cartelement-1").atomCart();
	$("#cartelement-2").atomCart();




Cart settings
-------

The cart accept a few settings, mostly of them are related to copy changes. You can find all settings in the plugin file.

Just pass your settings in a object when you create your cart.

	$("#cartelement").atomCart( {labelName: "Product"} );

Now the cart header will display the word "Product" instead of "Label"


Adding items
-------

You add items into the cart by running the method addItem.

	$("#cartelement").atomCart( "addItem", {label: "Laser pistol", attr: "Blue", price: 199} );

The label "value" represents the name of the item, "attr" is a combined description param for the product (it could be anything from format to color). The "attr" param is what makes this cart simple, not dozens of different product params, just one. If you want attr to say color, just set the cart headers attrLabel in the cart settings to "Color" and you are good to go. The cart allows any element then just label/attr/price, such as id if you want to match the cart item towards a backend.

There is also a optional "size" value, if you want to add more then 1 values at the time.

But to summon things up, the "label" and "attr" values is the key when identifying and comparing cart items, if the cart stumbles upon a product with the same name but different attr values, it will see them as different products. 


Removing items
-------

There are two ways to remove a cart item, removeItem and removeItemAt
This call will remove the first occuring cart item, but if the cart item has an amount bigger then 1, it will subtract that value by one.

	$("#cartelement").removeItemAt(0)


While this call will look into the cart after Laser Pistol with attr value Blue, and then remove it using the same rules as removeItemAt

	$("#cartelement").removeItem( {label: "Laser pistol", attr: "Blue"});



Currency
-------

AtomCart has a limited currency support, you set the currency by runtime (the cart itself only holds one currency at the time) using a modulator against the base currency. In this example we set the base currency (totalModulator) to 1 - since all our prices is based on the dollar. Then we change it using changeCurrency to the EUR and its value against the dollar (0.738).

	// Init the cart
	$("#cartelement").atomCart({totalPrefix: " $", totalModulator: 1}) ;	

	// Change the currency to EUR (this will force the cart to be redrawn and the rendered event to trigger)
	$("#cartelement").atomCart( "changeCurrency", "€", "", 0.738 );



Events
-------

You can use three events on this plugin, itemAdded, itemRemoved and rendered.
This event is run everytime a item is added into the cart


	$("#cartelement").bind("itemAdded", function (event){
		console.log( "Item was added!");
	});



And this event will trigger when a item has been removed

	$("#cartelement").bind("itemRemoved", function (event){
		console.log( "Item was removed!");
	});


This event is triggered every time the cart is beeing drawn/redrawn.

	$("#cartelement").bind("rendered", function (event){
		console.log( "The cart has been redrawn!");
	});


