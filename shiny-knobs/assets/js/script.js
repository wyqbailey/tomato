$(function(){
	
	var colors = [
		'26e000','2fe300','37e700','45ea00','51ef00',
		'61f800','6bfb00','77ff02','80ff05','8cff09',
		'93ff0b','9eff09'
	];
	
	var rad2deg = 180/Math.PI;
	var deg = 0;
	var bars = $('#bars');
	
	for(var i=0;i<colors.length;i++){
		
		deg = i*30;
		
		// Create the colorbars
		
		$('<div class="colorBar">').css({
			backgroundColor: '#'+colors[i],
			transform:'rotate('+deg+'deg)',
			top: -Math.sin(deg/rad2deg)*80+100,
			left: Math.cos((180 - deg)/rad2deg)*80+100,
		}).appendTo(bars);
	}
	
	var colorBars = bars.find('.colorBar');
	var numBars = 0, lastNum = -1;
	
	$('#control').knobKnob({
		snap : 10,
		value: 154,
		turn : function(ratio){
			numBars = Math.round(colorBars.length*ratio);
			console.log(ratio*60);
			
			// Update the dom only when the number of active bars
			// changes, instead of on every move
			
			if(numBars == lastNum){
				return false;
			}
			lastNum = numBars;
			
			colorBars.removeClass('active').slice(0, numBars).addClass('active');
		}
	});
	
});
