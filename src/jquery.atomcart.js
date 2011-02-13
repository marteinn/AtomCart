/**
*
* Copyright (c) 2011 Martin Sandström
* Licensed under the MIT License
* http://www.opensource.org/licenses/mit-license.php
*
* @version 0.1 beta
* 
* http://www.marteinn.se
*    
*/


(function($){


	var defaults = {
		// Header params
		'labelName'     	: 'Label'		// Header label text
		, 'attrName' 		: 'Attr'		// Header attr text
		, 'sizeName' 		: 'Quantity'	// Header size text
		, 'totalName' 		: 'Total'		// Header total text
		
		// Interface params
		, 'removeName' 		: 'Remove'		// Item remove text
		, 'sumName' 		: 'Sum: '		// Sum text
		
		// Currency
		, 'totalPrefix' 	: ''			// Prefix param, ie "$ "
		, 'totalSuffix' 	: ''			// Suffix param, ie " kr" (some value conversions use prefix, some uses suffix)
		, 'totalModulator' 	: 1				// Total base modulator
		
		// Boolean settings
		, 'hideSum'			: false			// Toggle between show/hide sum
		, 'hideOnEmpty' 	: false			// Toggle between showing a empty cart or not
	};
	
	var methods = {
		
		// Constructor
		init : function ( options )
		{
			

			return this.each( function(){
				var data = $(this).data( "atomCart" );

				if( !data )
				{
					options = $.extend({}, defaults, options); 
					
					$(this).data( "atomCart", {items: [], options: options} );
					$(this).addClass( "atom-cart" );

					// add header
					$(this).append( 
						'<div class="header"><div class="label">'+options.labelName+'</div><div class="attr">'+options.attrName+'</div><div class="size">'+options.sizeName+'</div><div class="total">'+options.totalName+'</div></div>'
					);

					$(this).append( '<hr />');
					
					// add cart item container
					$(this).append( '<div class="items"></div>');
					
					// cart sum
					if( !options.hideSum )
					{
						$(this).append( '<div class="sum"><div class="sum-label">'+options.sumName+'</div><div class="sum-value"></div></div>');
					}
					
					methods._renderItems.apply( this, arguments );
				}
			});
		}
		
		// Remove the cart
		, destroy : function()
		{
			return this.each(function(){

				var data = $(this).data('atomCart');

	         	$(window).unbind('.atomCart');
	         	data.atomCart.remove();
	         	$(this).removeData('atomCart');
				$(this).find(".item a.remove").unbind('click');

	       });
		}
		
		// Add a cart item
		, addItem : function ( item )
		{
			if( item.label == undefined || item.attr == undefined || item.price == undefined )
				$.error( 'The item is not a valid atomCart item' );
			
			return this.each(function(){

				var data = $(this).data('atomCart');
				var items = data.items;
				var found = false;
			
				// check if the item is already added
				$.each( items, function ( key, value ){
					
					// item is already in cart, increment size
					if( value.label == item.label && value.attr == item.attr )
					{
						value.size += (isNaN(item.size) ? 1 : item.size);
						found = true;
					}
				});
				
				// the item is new
				if( !found )
				{
					item.size = (isNaN(item.size) ? 1 : item.size);
					items.push( item );
				}
				
				$(this).trigger('itemAdded');
				
				// render cart items
				methods._renderItems.apply( this, arguments );

	       });
		}
		
		// Return cart item index by object values label and attr
		, getItemIndex : function( item )
		{	
			var data = $(this).data("atomCart");
			var items = data.items;
			var i;
			var l = items.length;
			
			for( i=0; i<l; ++i )
			{
				if( items[i].label == item.label && items[i].attr == item.attr )
					return i;
			}
			
			return -1;
		}
		
		// Remove a cart item by object values label and attr
		, removeItem : function ( item )
		{
			if( !isNaN(item) )
				$.error( 'Use removeItemAt when you remove by index' );
			
			return $(this).each(function(){
				var index;

				if( isNaN(item) )
				{
					index = methods.getItemIndex.apply( this, [item] );

					if( index == -1 )
						$.error( 'This item is not in the cart' );
					else
						methods.removeItemAt.apply( this, [index] );
				}			
			});

		}
		
		// Remove a item cart by index
		, removeItemAt: function ( index )
		{
			if( isNaN(index) )
				$.error( 'Use remove when you remove by object' );
				
			return $(this).each(function(){
				var data = $(this).data("atomCart");
				var items = data.items;
				var item;
				var child;
				
				if( index>=items.length )
					$.error( 'Index out of range' );
				
				item = items[index];
				
				if( item.size>1 )
					item.size--;
				else
				{
					child = $(this).find(".item:nth-child("+(index+1)+")");
					
					child.find("a.remove").unbind('click');
					child.remove();
					
					items.splice( index, 1 );
				}
				
				$(this).trigger('itemRemoved');
				
				methods._renderItems.apply( this, arguments );
				
			});			
		}
		
		// Remove all items from a cart
		, clear : function ()
		{
			return $(this).each(function(){
				var data = $(this).data("atomCart");
				
				data.items = [];
				
				methods._renderItems.apply( this, arguments );
			});
		}
		
		// Returns all cart items
		, allItems : function ()
		{
			var data = $(this).data("atomCart");
			
			return data.items;
		}
		
		// Prepare and return all cart items as a handy string (ready to be posted).
		// The returned value is formatted like this "1,34,12,15", but please note that it does require a .id param when you 
		// add your cart items
		, allItemsToString : function()
		{
			var data = $(this).data("atomCart");
			var items = data.items;
			var output = "";
			var l;
			
			$.each( items, function( key, value ){
				l = Number(value.size);
				
				while( l-- )
				{
					if( output.length )
						output += ",";
					output += String(value.id);
				}
			});
			
			return output;
		}
		
		// Returns the amount of items in cart
		, numItems : function ()
		{
			var data = $(this).data("atomCart");
			
			return data.items.length;
		}
		
		// Returns the total price of all items combined
		, totalPrice : function ( formatted )
		{
			var data = $(this).data("atomCart");
			var options = data.options;
			var modulator = options.totalModulator;
			var items = data.items;
			var total = 0;
			var i;
			var l;
			
			l = items.length;
			
			for( i=0; i<l; ++i )
				total += items[i].size*(items[i].price);
				
			return methods.convertPrice.apply( this, [total, formatted] )

		}
		
		// This method returns a string formatted price, based on the cost modulator and totalPrefix/totalSuffix
		, convertPrice : function( price, stringConversion )
		{
			var data = $(this).data("atomCart");
			var options = data.options;
			var modulator = options.totalModulator;
			
			if( stringConversion )
				return options.totalPrefix+String(Math.ceil(price*modulator))+options.totalSuffix;
			return Math.ceil(price*modulator);
		}
		
		// Use this method when you want to display another currency
		, changeCurrency : function ( totalPrefix, totalSuffix, totalModulator )
		{
			return $(this).each(function(){

				var data = $(this).data("atomCart");
				var options = data.options;
				
				options.totalPrefix = totalPrefix;
				options.totalSuffix = totalSuffix;
				options.totalModulator = !isNaN(totalModulator) ? totalModulator : 1;
				
				methods._renderItems.apply( this );
			});
		}
		
		// This private method updates the item rendering
		, _renderItems : function ()
		{
			
			return $(this).each(function(){

				var data = $(this).data("atomCart");
				var items = data.items;
				var options = data.options;
				var $this = $(this);
				var total;
				
				$(this).find(".item a.remove").unbind('click');
				$(this).find(".item").remove();
				
				$.each( items, function( key, value){
					total = value.size*value.price;
					total = (total);
					
					total = methods.convertPrice.apply( $this, [total, true] );
					
					$this.find(".items").append( 
						'<div class="item"><div class="label">'+value.label+'</div><div class="size">'+value.attr+'</div><div class="amount">'+value.size+'</div><div class="total">'+total+'</div><div class="buttons"><a class="remove" href="#"><span>'+options.removeName+'</span></a></div></div>' 
					);
				});
				
				$(this).find(".item .remove").click( function()
				{
					var cart = $(this).closest( ".atom-cart");
					var index = $(this).closest(".item").index();
					
					cart.atomCart( "removeItemAt", index );
					
					return false;
				});
				
				if( !options.hideSum )
				{
					$(this).find(".sum-value").text( 
						options.totalPrefix+String(methods.totalPrice.apply( this ))+options.totalSuffix
					);
				}
				
				if( options.hideOnEmpty && !items.length )
					$(this).hide();
				else
					$(this).show();
					
				$(this).trigger('rendered');
			});
		}
		
		
	};

	// gateway
	$.fn.atomCart = function( method ) { 
		
		if ( methods[method] ) 
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		else if ( typeof method === 'object' || ! method ) 
			return methods.init.apply( this, arguments );
		else 
			$.error( 'Method ' +  method + ' does not exist on jQuery.atomCart' );
	}
	


})(this.jQuery);