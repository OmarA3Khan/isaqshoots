var slideshow = document.getElementById("slideshow-landing");

const slides = ["https://images.unsplash.com/photo-1493106819501-66d381c466f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80", "http://i.imgur.com/K3mPv14.jpg", "http://i.imgur.com/SBEmFpv.jpg", "http://i.imgur.com/emvhOnb.jpg", "http://i.imgur.com/2LSMCmJ.jpg", "http://i.imgur.com/TVGe0Ef.jpg"];

var index = -1;

setInterval(function(){
	if (index === slides.length - 1){
		index === 0;
	}else{
		index++;
	}
	slideshow.src = slides[index];
}, 7000);

function slide(){
	if (index === slides.length - 1){
	index === 0;
	}else{
		index++;
	}
	SwitchPic(index);
}
 
function SwitchPic(index) {
	slideshow.src = slides[index];
}

slide();