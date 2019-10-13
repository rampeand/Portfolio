var beeJokes = [
  "Q: Why did the bee get married? A: Because he found his honey.",
  "Q: What do you call a bee that can't stop eating? A: Chub-bee.",
  "Q: Who protects the Queen Bee? A: Her Hub-bee.",
  "Q. What's the last thing to go through a bees mind when it hits your windshield? A: Its bum.",
  "Q: Why did the bee go to the barbershop? A: To get a buzz-cut.",
  "Q: What kind of bee can't be understood? A: A mumble bee!",
  "Q: What do you call a bee that lives in America? A: A USB.",
  "Q: What do you get when you cross a race dog with a bumble bee? A: A Greyhound Buzz.",
  "Q: What is a bee’s favourite sport? A: Rug-Bee.",
  "Q: What did the bee say to the naughty bee? A: Bee-hive yourself!",
  "Q: What do you call a bee that prefers nectar to pollen? A: Snob-bee.",
  "Q: Why do bees hum? A: Because they've forgotten the words!",
  "Q: What did the bee say to the flower? A: Why, hello honey!",
  "Q: What do you call a bee who single handily defended the colony from a wasp attack? A: Not to shab-ee.",
  "Q: What did the confused bee say? A: To bee or not to bee!",
  "Q: What do you call a Bee who is having a bad hair day? A: A Frisbee.",
  "Q: What do you give a bee on the first day of class? A: A Sylla-buzz.",
  "Q: What is a bee’s favourite shape? A: A Rhom-buzz, of course.",
  "Q: Why do bee’s hum? A: They forget the words to the song.",
  "Q: What do you call a bee you can't share secrets with? A: A blab-bee.",
  "Q: What did the bee say to the other bee when they landed on the same flower? A: Buzz off.",
  "Q: What does a bee style his hair with? A: A honeycomb.",
  "Q: What do you call a bee that had a spell put on him? A: He's bee-witched!",
  "Q: Why do bees buzz? A: Because they can't whistle!",
  "Q: Can bees fly in the rain? A: Not without their yellow jackets!",
  "Q: What flies in the air and goes zzub zzub? A: A bee flying backwards.",
];

window.beeJoke = function() {
  var randJoke = beeJokes[Math.floor(Math.random() * (beeJokes.length))];
  var posAnswer = randJoke.search("A:");

  var $strQuestion = $('<span>' + randJoke.slice(0,posAnswer) + '</span>');
  var $strAnswer = $('<span>' + randJoke.slice(posAnswer) + '</span>');

  setTimeout(showQuestion, 2000);
  setTimeout(showAnswer, 7000);
  function showQuestion() {
    Materialize.toast($strQuestion, 9450, '.toast');
  };
  function showAnswer() {
    Materialize.toast($strAnswer, 7450, '.toast');
  };
};


//this is where we apply opacity to the arrow
$(window).scroll( function(){

  //get scroll position
  var topWindow = $(window).scrollTop();
  //multipl by 1.5 so the arrow will become transparent half-way up the page
  var topWindow = topWindow * 1.5;

  //get height of window
  var windowHeight = $(window).height();

  //set position as percentage of how far the user has scrolled
  var position = topWindow / windowHeight;
  //invert the percentage
  position = 1 - position;

  //define arrow opacity as based on how far up the page the user has scrolled
  //no scrolling = 1, half-way up the page = 0
  $('.arrow-wrap').css('opacity', position);

});

//Code stolen from css-tricks for smooth scrolling:
$(function() {
  $('a[href*=#]:not([href=#])').click(function() {
    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});

/*
window.NavCenter() = (function() {

}());

// when you scroll into the body
window.NavEntry() = function() {
  Materialize.showStaggeredList($(el));
}
*/
