window.onload = function(){

    this.document.addEventListener('deviceready', setUp);
};

var _audio = new Audio();

var btn_settings = '';
var btn_home = '';
var btn_music = '';
var btn_search = '';

var song_artist = '';
var song_title = '';
var song_key = '';

var zahtjev = new XMLHttpRequest();
var odgovor = new Object(); 

/* API --> https://apiseeds.com/documentation/lyrics */
const api_url = 'https://orion.apiseeds.com/api/music/lyric/:';
const api_key = '9WRXueGXuDmHcrqlZfHoPAt8et118HejrxnA27vWL8S2UUIoEtTy41mcn77WVm9K';

default_lyrics =   "Just a young gun with a quick fuse"+'<br>'+
                    "I was uptight, wanna let loose"+'<br>'+
                    "I was dreaming of bigger things"+'<br>'+
                    "And wanna leave my own life behind"+'<br>'+
                    "Not a yes sir, not a follower"+'<br>'+
                    "Fit the box, fit the mold"+'<br>'+
                    "Have a seat in the foyer, take a number"+'<br>'+
                    "I was lightning before the thunder"+'<br>'+'<br>'+

                    "Thunder, thunder..."+'<br>'+'<br>'+

                    "Thunder, feel the thunder"+'<br>'+
                    "Lightning and the thunder"+'<br>'+
                    "Thunder, feel the thunder"+'<br>'+
                    "Lightning and the thunder"+'<br>'+
                    "Thunder, thunder"+'<br>'+
                    "Thunder"+'<br>'+'<br>'+

                    "Kids were laughing in my classes"+'<br>'+
                    "While I was scheming for the masses"+'<br>'+
                    "Who do you think you are?"+'<br>'+
                    "Dreaming 'bout being a big star"+'<br>'+
                    "You say you're basic, you say you're easy"+'<br>'+
                    "You're always riding in the back seat"+'<br>'+
                    "Now I'm smiling from the stage while"+'<br>'+
                    "You were clapping in the nose bleeds"+'<br>'+'<br>'+

                    "Thunder, thunder..."+'<br>'+'<br>'+

                    "Thunder, feel the thunder"+'<br>'+
                    "Lightning and the thunder"+'<br>'+
                    "Thunder, feel the thunder"+'<br>'+
                    "Lightning and the thunder"+'<br>'+
                    "Thunder";

                    
function setUp()
{
    _audio = document.getElementById('_audio');
    document.getElementById('_audio').addEventListener('click', play);
    document.getElementById('btnplay').addEventListener('click', play);

    song_artist = document.getElementById('song_artist').innerHTML;
    song_title = document.getElementById('song_title').innerHTML;
    song_key = ''.concat(song_artist,song_title);

    document.getElementById('btnloadlyrics').addEventListener('click', loadlyrics);
    document.getElementById('btndefaultlyrics').addEventListener('click', defaultlyrics);
    
}


function play()
{
    if (_audio.paused)
    {
        _audio.play();  
    } 
    else 
    {
        _audio.pause();
    }
    
}

function pause()
{
    _audio.pause();
}

function stop()
{
    _audio.load();
}

function defaultlyrics()
{

    document.getElementById("lyrics").innerHTML = default_lyrics;

}
function loadlyrics()
{
    if (localStorage.getItem(song_key) == null || localStorage.getItem(song_key) == '') 
    {
        //window.alert('load lyrics');
        zahtjev = new XMLHttpRequest();
        zahtjev.onreadystatechange = metoda;
        /* GET: 'https://orion.apiseeds.com/api/music/lyric/:artist/:track' */
        zahtjev.open('GET', ''.concat(api_url,song_artist,'/:',song_title,'?apikey=',api_key), true);
        zahtjev.send();
    }
    else
    {
        //window.alert('from local storage');
        document.getElementById("lyrics").innerHTML = localStorage.getItem(song_key);
    }
    
}
function metoda()
{
    //window.alert('metoda');
    
    if (zahtjev.readyState == 4)
    {
        //window.alert('ready state 4');
        if (zahtjev.status == 200) 
        {
            //window.alert('status 200');

            odgovor = JSON.parse(zahtjev.responseText);
            document.getElementById("lyrics").innerHTML = odgovor.result.track.text; 
            localStorage.setItem(song_key,odgovor.result.track.text);
            //window.alert('from XMLHttpRequest');

        }
        if (zahtjev.statusText == 404) 
        {
            //window.alert('status 404');
            
            document.getElementById("lyrics").innerHTML = "lyrics not found... check your song info and try again :-)";
        }  
    }
}



