var IP = '192.168.15.200';

window.onload = function () 
{
    this.document.addEventListener('deviceready', setUp);
};



var btn_settings = '';
var btn_home = '';
var btn_music = '';
var btn_play = '';

var _audio = new Audio();

var song_artist = '';
var song_title = '';
var song_key = '';

var zahtjev = new XMLHttpRequest();
var odgovor = new Object();

var zahtjev_db = new XMLHttpRequest();
var odgovor_db = new Object();

var zahtjev_db_put = new XMLHttpRequest();
var _objekt = new Object();
var str_object = '';

var favorites = [];
var username, password;
var zahtjev_db_fav_get = new XMLHttpRequest();
var odgovor_db_fav_get = new Object();

var zahtjev_db_fav_post = new XMLHttpRequest();
var odgovor_db_fav_post = new Object();

/* API --> https://apiseeds.com/documentation/lyrics */
//var songs_info = [{"_id":"5e2e08b41c9d44000014017c","name":"Thunder","artist":"Imagine Dragons","album":"Believer","genre":"pop","path":"music/Imagine Dragons - Thunder.mp3"},{"_id":"5e2e09f01c9d44000014017d","name":"Radioactive","artist":"Imagine Dragons","album":"Believer","genre":"pop rock","path":"music/Imagine Dragons - Radioactive.mp3"},{"_id":"5e2e0a481c9d44000014017e","name":"One More Light","artist":"Linkin park","album":"One More Light","genre":"pop rock","path":"music/Linkin Park - One More Light.mp3"},{"_id":"5e2e0ab81c9d44000014017f","name":"Battle Symphony","artist":"Linkin park","album":"One More Light","genre":"pop","path":"music/Linkin Park - One More Light.mp3"}];
const api_url = 'https://orion.apiseeds.com/api/music/lyric/:';
const api_key = '9WRXueGXuDmHcrqlZfHoPAt8et118HejrxnA27vWL8S2UUIoEtTy41mcn77WVm9K';

var songs_info = '';
var songs = '';
var artist_songs = [];

var _range = '';


var curtimetext, durtimetext;
var progress = '';

function setUp() {
 
    _audio = document.getElementById('_audio');
    _range = document.getElementById('_range');

    curtimetext = document.getElementById("curtimetext");
    durtimetext = document.getElementById("durtimetext");
    
    progress = document.getElementById('progress_bar');
    
    _audio.addEventListener("timeupdate", function(){ seektimeupdate(); });
    
    song_artist = document.getElementById('song_artist').innerHTML;
    song_title = document.getElementById('song_title').innerHTML;
    song_key = ''.concat(song_artist, song_title);

    document.getElementById('_audio').addEventListener('click', play);
    document.getElementById('btnsong').addEventListener('click', song);
    document.getElementById('btnnext').addEventListener('click', songnext);
    document.getElementById('btnprevious').addEventListener('click', songprevious);
    
    

    btn_home = document.getElementsByName('btnhome');
    btn_settings = document.getElementsByName('btnsettings');
    btn_music = document.getElementsByName('btnmusic');

    btn_play = document.getElementsByName('btnplay');
    
    
    document.addEventListener('load',load_all_from_db());  //sve podatke o pjesmama iz Mongo baze ucitaj u globalnu varijablu songs_info
    document.addEventListener('load',load_all_from_db_fav());  //sve podatke o favoritima iz Mongo baze ucitaj u globalnu varijablu favorites
    
    
    _audio.addEventListener('ended', songnext);
    
        
    document.getElementById('btnloadlyrics').addEventListener('click', load_lyrics_from_api);

    document.getElementById('btnedit').addEventListener('click', get_song_info);
    document.getElementById('btnsave').addEventListener('click', save_song_info);
    
    for (let i = 0; i < btn_settings.length; i++) {
        const element = btn_settings[i];
        element.addEventListener('click', settings);
    }
    for (let i = 0; i < btn_home.length; i++) {
        const element = btn_home[i];
        element.addEventListener('click', home);
    }
    for (let i = 0; i < btn_music.length; i++) {
        const element = btn_music[i];
        element.addEventListener('click', music);
    }
    
    for (let i = 0; i < btn_play.length; i++) {
        const element = btn_play[i];
        element.addEventListener('click', play)
    }

    
}

function seektimeupdate()
{
    var nt = _audio.currentTime * (100 / _audio.duration);
    try {
        progress.value = nt.toPrecision(3);
    } catch (error) {
        progress.value = 0;
    }
    //console.log(progress.value);
    //console.log('nt:',nt);
    var curmins = Math.floor(_audio.currentTime / 60);
    var cursecs = Math.floor(_audio.currentTime - curmins * 60);
    var durmins = Math.floor(_audio.duration / 60);
    var dursecs = Math.floor(_audio.duration - durmins * 60);
    if(cursecs < 10){ cursecs = "0"+cursecs; }
    if(dursecs < 10){ dursecs = "0"+dursecs; }
    if(curmins < 10){ curmins = "0"+curmins; }
    if(durmins < 10){ durmins = "0"+durmins; }
    curtimetext.innerHTML = curmins+":"+cursecs;
    durtimetext.innerHTML = durmins+":"+dursecs;
}

function settings() {
    window.location.href = "#settings_page";
}
function home() {
    window.location.href = "#home_page";
}
function music() {
    window.location.href = "#music_page";
}

function song()
{
    for (let i = 0; i < songs_info.length; i++) 
    {
        if (songs_info[i]['path'] == _audio.innerText)
        {
            document.getElementById('song_title').innerHTML = songs_info[i]['name'];
            document.getElementById('song_artist').innerHTML = songs_info[i]['artist'];
            document.getElementById('btnsong').innerHTML = songs_info[i]['name'] + '-' + songs_info[i]['artist'];

        }
    }
    load_lyrics_from_api();
    _audio.play();
    
    window.location.href = "#song_page";
}
function play() 
{
    for (let i = 0; i < songs_info.length; i++) 
    {
        if (songs_info[i]['path'] == _audio.innerText)
        {
            document.getElementById('song_title').innerHTML = songs_info[i]['name'];
            document.getElementById('song_artist').innerHTML = songs_info[i]['artist'];
            document.getElementById('btnsong').innerHTML = songs_info[i]['name'] + '-' + songs_info[i]['artist'];

        }
    }
    if (_audio.paused) 
    {
        _audio.play();
    }
    else 
    {
        _audio.pause();
    }
}

function get_song_info() //metoda kojom se dohvacaju podaci za azuriranje detalja pjesme
{
    for (let i = 0; i < songs_info.length; i++) {
        var song = songs_info[i];
        if (song['path'] == _audio.innerText) {
            document.getElementById('edit_song_id').value = song['_id'];
            document.getElementById('edit_song_name').value = song['name'];
            document.getElementById('edit_song_artist').value = song['artist'];
            document.getElementById('edit_song_album').value = song['album'];
            document.getElementById('edit_song_genre').value = song['genre'];
            document.getElementById('edit_song_path').value = song['path'];
            break;
        }
        
    }
}
3
//------------------------- GET ZAHTJEV - TRACKS-------------------------------------------------------------------------------------------------------
function load_all_from_db() 
{
    //window.alert('dohvati');
    zahtjev_db = new XMLHttpRequest();
    zahtjev_db.onreadystatechange = metoda_db;
    zahtjev_db.open('GET', ''.concat('http://',IP,':4000/tracks'), true);        
    zahtjev_db.send();  
}
function metoda_db()
{
    //window.alert('metoda db');
    if (zahtjev_db.readyState == 4)
    {
        //window.alert('state 4');
        if (zahtjev_db.status == 200)
        {
            //window.alert('status ok');
            odgovor_db = JSON.parse(zahtjev_db.responseText);
            songs_info = odgovor_db;
            addToSongsList(songs_info);
            addToArtistsList(songs_info);
            addToAlbumsList(songs_info);
            addToGenresList(songs_info);
    
            _audio.src = songs_info[0]['path'];
            _audio.innerText = songs_info[0]['path'];
            _audio.load();

        }
    }
}

//------------------------- GET ZAHTJEV - FAVORITES ---------------------------------------------------------------------------------------------------
function load_all_from_db_fav() 
{
    //window.alert('dohvati');
    zahtjev_db_fav_get = new XMLHttpRequest();
    zahtjev_db_fav_get.onreadystatechange = metoda_db_fav_get;
    zahtjev_db_fav_get.open('GET', ''.concat('http://',IP,':4000/favorites'), true);        
    zahtjev_db_fav_get.send();  
}
function metoda_db_fav_get()
{
    //window.alert('metoda db');
    if (zahtjev_db_fav_get.readyState == 4)
    {
        //window.alert('state 4');
        if (zahtjev_db_fav_get.status == 200)
        {
            //window.alert('status ok');
            odgovor_db_fav_get = JSON.parse(zahtjev_db_fav_get.responseText);
            //console.log(odgovor_db_fav_get);
            username = odgovor_db_fav_get[0]['user']['username'];
            password = odgovor_db_fav_get[0]['user']['password'];
            favorites = odgovor_db_fav_get[0]['favorites'];
            
            addToFavoritesList(songs_info);
        }
    }
}

//------------------------- PUT ZAHTJEV  - TRACKS ------------------------------------------------------------------------------------------------------
function save_song_info() //metoda koja salje PUT zahtjev za spremanje ažuriranih podataka pjesme u bazu podataka
{
    //window.alert('put');
    zahtjev_db_put = new XMLHttpRequest();
    for (let i = 0; i < songs_info.length; i++) {
        const song = songs_info[i];
        if (song['path'] == _audio.innerText) {
            //console.log(''.concat('http://',IP,':4000/tracks/',song['_id']));
            zahtjev_db_put.open('PUT',''.concat('http://',IP,':4000/tracks/',song['_id']), true);     
        }
        
    }
    var _object = { name : document.getElementById('edit_song_name').value , 
                artist: document.getElementById('edit_song_artist').value, 
                album: document.getElementById('edit_song_album').value,
                genre: document.getElementById('edit_song_genre').value,
                path: document.getElementById('edit_song_path').value 
            };
    zahtjev_db_put.onreadystatechange = metoda_db_put;
    zahtjev_db_put.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    zahtjev_db_put.send(JSON.stringify(_object));  

}
function metoda_db_put()
{
    //console.log('metoda db put');
    if (zahtjev_db_put.readyState == 4)
    {
        //console.log('state 4');
        if (zahtjev_db_put.status == 200)
        {
           //console.log('status ok');
            songs_info = JSON.parse(zahtjev_db_put.responseText); 
            addToSongsList(songs_info);
            addToArtistsList(songs_info);
            addToAlbumsList(songs_info);
            addToGenresList(songs_info);
            addToFavoritesList(songs_info);
            //console.log(zahtjev_db_put.responseText);
            //load_all_from_db();
            document.getElementById('song_title').innerHTML = document.getElementById('edit_song_name').value;
            document.getElementById('song_artist').innerHTML = document.getElementById('edit_song_artist').value;
            document.getElementById('btnsong').innerHTML = document.getElementById('edit_song_name').value + '-' + document.getElementById('edit_song_artist').value;
            
        }
        else
        {
            console.log(zahtjev_db_put.status);
        }
    }
}

//------------------------- DINAMICKO DODAVANJE <li> ELEMENATA - TRACKS --------------------------------------------------------------------------------
function addToSongsList(songs) //metoda koja iz baze podataka generira elemente za pjesme i dodaje im event listenere
{                              //songs je parametar kojem saljemo popis svih podataka o pjesmama iz baze
    document.getElementById('ul_songs').innerHTML = '';
    
    for (let i = 0; i < songs.length; i++) {
        const song_info = songs[i];
        if (i == 0) {
            var element = '<li class="ui-first-child pjesma" data-icon="none" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#" ><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
        }
        else if (i == (songs.length - 1)) {
            var element = '<li class="ui-last-child pjesma" data-icon="none" name="_song"><a  class="ui-btn ui-btn-icon-right ui-icon-none"  href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
        }
        else
        {                 
            var element = '<li data-icon="none" class="pjesma" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';

        }        
        $("#ul_songs").append(element);               
    }
    $('.pjesma').off();
    $('.pjesma').on('click', function()
    {
        for (let i = 0; i < songs_info.length; i++) //prolazeci kroz popis detalja svih pjesama iz baze podataka trazimo podatke o pjesmi na koju je kliknuto
        {
            var el = songs_info[i];
            console.log('this:',$(this).find("a").find("h2")[0].innerText);
            console.log(el['artist']);

            if($(this).find("a").find("h2")[0].innerText == el['name'] && $(this).find("a").find("p")[0].innerText == el['artist']) 
            {
                document.getElementById('song_title').innerHTML = el['name']; //na stranici #song_page se postavlja naziv pjesme i ime izvodaca
                document.getElementById('song_artist').innerHTML = el['artist'];
                document.getElementById('btnsong').innerHTML = el['name'] + ' - ' + el['artist'];
                _audio.src = el['path'];  //postavljanje src atributa audio elementa na putanju odabrane pjesme koja je i id kliknutog elementa
                _audio.innerText = el['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();  //za odabranu pjesmu dohvatimo tekst 
                break;
            }
        }
        window.location.href = "#song_page";
    });
   
    
    
}
function addToArtistsList(songs) //metoda kojom se generiraju <li> tagovi koji predtavljaju izvodace
{
    var artists = []; //niz u koji se spremaju izvdaci, bez ponavljanja
    document.getElementById('ul_artists').innerHTML = '';

    for (let i = 0; i < songs.length; i++) 
    {
        const song_info = songs[i];
        if (i == 0) 
        {
            var element = '<li class="ui-first-child izvodac" data-icon="none" id="'+ song_info['artist'] + '"' +'><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["artist"] + '</h2></a></li>';
        }
        else if (i == (songs.length - 1)) 
        {
            var element = '<li class="ui-last-child izvodac" data-icon="none" id="'+ song_info['artist'] + '"' +'><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["artist"] + '</h2></a></li>';
        }
        else
        {                 
            var element = '<li data-icon="none" class="izvodac" id="'+ song_info['artist'] + '"' +'><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["artist"] + '</h2></a></li>';
        }        
        if ( artists.includes(song_info['artist']) == false ) //ako je se taj izvodac nije vec spremijo u popis izvodaca, generiraj mu element i dodaj ga u popis
        {
            $("#ul_artists").append(element);
            artists.push(song_info['artist']);
        }
    }
    $('.izvodac').off();
    $('.izvodac').on('click', function()
    {
        document.getElementById('songs_by_artist').innerHTML = $(this).find("a").find("h2")[0].innerText;
        document.getElementById('ul_songs_by_artist').innerHTML = '';
        for (let i = 0; i < songs.length; i++) 
        {
            const song_info = songs[i];
            if ($(this).find("a").find("h2")[0].innerText == song_info['artist']) 
            {
                if (i == 0)
                {
                    var element = '<li class="ui-first-child ipjesma" data-icon="none" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#" ><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else if (i == (songs.length - 1)) 
                {
                    var element = '<li class="ui-last-child ipjesma" data-icon="none" name="_song"><a  class="ui-btn ui-btn-icon-right ui-icon-none"  href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else
                {                 
                    var element = '<li data-icon="none" class="ipjesma" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }      
                $("#ul_songs_by_artist").append(element);

            }
        }
        $('.ipjesma').off();
        $('.ipjesma').on('click', function()
    {
        for (let i = 0; i < songs_info.length; i++) //prolazeci kroz popis detalja svih pjesama iz baze podataka trazimo podatke o pjesmi na koju je kliknuto
        {
            var el = songs_info[i];
            if($(this).find("a").find("h2")[0].innerText == el['name'] && $(this).find("a").find("p")[0].innerText == el['artist']) 
            {
                document.getElementById('song_title').innerHTML = el['name']; //na stranici #song_page se postavlja naziv pjesme i ime izvodaca
                document.getElementById('song_artist').innerHTML = el['artist'];
                document.getElementById('btnsong').innerHTML = el['name'] + ' - ' + el['artist'];
                _audio.src = el['path'];  //postavljanje src atributa audio elementa na putanju odabrane pjesme koja je i id kliknutog elementa
                _audio.innerText = el['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();  //za odabranu pjesmu dohvatimo tekst 
                break;
            }
        }
        window.location.href = "#song_page";
    });
        window.location.href = "#artist_page";

    });
}
function addToAlbumsList(songs) //metoda kojom se generiraju <li> tagovi koji predstavljaju albume
{
    var albums = []; //niz za spremanje albuma, bez ponavljanja
    document.getElementById('ul_albums').innerHTML = '';
    for (let i = 0; i < songs.length; i++) 
    {
        const song_info = songs[i];
        if (i == 0) 
        {
            var element = '<li class="ui-first-child album" data-icon="none"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["album"] + '</h2><p>'+ song_info['artist'] +'</p></a></li>';
        }
        else if (i == (songs.length - 1)) 
        {
            var element = '<li class="ui-last-child album" data-icon="none"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["album"] + '</h2><p>'+ song_info['artist'] +'</p></a></li>';
        }
        else
        {                 
            var element = '<li data-icon="none" class="album" ><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["album"] + '</h2><p>'+ song_info['artist'] +'</p></a></li>';
        }        
        if ( albums.includes(song_info["album"]) == false )
        {
            $("#ul_albums").append(element);
            albums.push(song_info["album"]);
        }
    }
    $('.album').off();
    $('.album').on('click', function()
    {
        document.getElementById('songs_by_album').innerHTML = $(this).find("a").find("h2")[0].innerText;
        document.getElementById('ul_songs_by_album').innerHTML = '';
        for (let i = 0; i < songs.length; i++) 
        {
            const song_info = songs[i];
            if ($(this).find("a").find("h2")[0].innerText == song_info['album']) 
            {
                if (i == 0)
                {
                    var element = '<li class="ui-first-child apjesma" data-icon="none" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#" ><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else if (i == (songs.length - 1)) 
                {
                    var element = '<li class="ui-last-child apjesma" data-icon="none" name="_song"><a  class="ui-btn ui-btn-icon-right ui-icon-none"  href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else
                {                 
                    var element = '<li data-icon="none" class="apjesma" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }   
                $("#ul_songs_by_album").append(element);
            }
        }
        $('.apjesma').off();
        $('.apjesma').on('click', function()
    {
        for (let i = 0; i < songs_info.length; i++)
        {
            var el = songs_info[i];
            //console.log('this:',$(this).find("a").find("h2")[0].innerText);
            //console.log(el['artist']);

            if($(this).find("a").find("h2")[0].innerText == el['name'] && $(this).find("a").find("p")[0].innerText == el['artist']) 
            {
                document.getElementById('song_title').innerHTML = el['name']; //na stranici #song_page se postavlja naziv pjesme i ime izvodaca
                document.getElementById('song_artist').innerHTML = el['artist'];
                document.getElementById('btnsong').innerHTML = el['name'] + ' - ' + el['artist'];
                _audio.src = el['path'];  //postavljanje src atributa audio elementa na putanju odabrane pjesme koja je i id kliknutog elementa
                _audio.innerText = el['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();  //za odabranu pjesmu dohvatimo tekst 
                break;
            }
        }
        window.location.href = "#song_page";
    });
        window.location.href = "#album_page";
    });
}
function addToGenresList(songs)
{
    var genres = [];
    document.getElementById('ul_genres').innerHTML = '';

    for (let i = 0; i < songs.length; i++) 
    {
        const song_info = songs[i]; 
        if ( genres.includes(song_info["genre"]) == false )
        {
            if (i == 0) 
            {
            var element = '<li class="ui-first-child zanr" data-icon="none"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["genre"] + '</h2><p></p></a></li>';
            }
            else if (i == (songs.length - 1)) 
            {
            var element = '<li class="ui-last-child zanr" data-icon="none"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["genre"] + '</h2><p></p></a></li>';
            }
            else
            {                 
            var element = '<li data-icon="none" class="zanr"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["genre"] + '</h2><p></p></a></li>';
            }       
            $("#ul_genres").append(element);
            genres.push(song_info["genre"]);
        }
    }
    $('.zanr').off();
    $('.zanr').on('click', function()
    {
        document.getElementById('songs_by_genre').innerHTML = $(this).find("a").find("h2")[0].innerText;
        document.getElementById('ul_songs_by_genre').innerHTML = '';
        for (let i = 0; i < songs.length; i++) 
        {
            const song_info = songs[i];
            if ($(this).find("a").find("h2")[0].innerText == song_info['genre']) 
            {
                if (i == 0)
                {
                    var element = '<li class="ui-first-child zpjesma" data-icon="none" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#" ><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else if (i == (songs.length - 1)) 
                {
                    var element = '<li class="ui-last-child zpjesma" data-icon="none" name="_song"><a  class="ui-btn ui-btn-icon-right ui-icon-none"  href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else
                {                 
                    var element = '<li data-icon="none" class="zpjesma" name="_song"><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }   
                $("#ul_songs_by_genre").append(element);
            }
        }
        $('.zpjesma').off();
        $('.zpjesma').on('click', function()
    {
        for (let i = 0; i < songs_info.length; i++)
        {
            var el = songs_info[i];
            //console.log('this:',$(this).find("a").find("h2")[0].innerText);
            //console.log(el['artist']);

            if($(this).find("a").find("h2")[0].innerText == el['name'] && $(this).find("a").find("p")[0].innerText == el['artist']) 
            {
                document.getElementById('song_title').innerHTML = el['name']; //na stranici #song_page se postavlja naziv pjesme i ime izvodaca
                document.getElementById('song_artist').innerHTML = el['artist'];
                document.getElementById('btnsong').innerHTML = el['name'] + ' - ' + el['artist'];
                _audio.src = el['path'];  //postavljanje src atributa audio elementa na putanju odabrane pjesme koja je i id kliknutog elementa
                _audio.innerText = el['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();  //za odabranu pjesmu dohvatimo tekst 
                break;
            }
        }
        window.location.href = "#song_page";
    });
        window.location.href = "#genre_page";
    });
}
function addToFavoritesList(songs) //metoda kojom se generiraju <li> tagovi koji predstavljaju favorite
{
    document.getElementById('ul_favorites').innerHTML = '';

    for (let i = 0; i < songs.length; i++) {
        const song_info = songs[i];
        var br = 0;
        favorites.forEach(fav => 
        {
            if (fav == song_info['_id'] && br <= 4) 
            {
                if (i == 0) 
                {
                    var element = '<li class="ui-first-child fpjesma" data-icon="none" name="_song" id="'+ song_info['path'] + '"' +'><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#" ><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else if (i == (songs.length - 1)) 
                {
                    var element = '<li class="ui-last-child fpjesma" data-icon="none" name="_song" id="'+ song_info['path'] + '"' +'><a  class="ui-btn ui-btn-icon-right ui-icon-none"  href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }
                else
                {                 
                    var element = '<li data-icon="none" class="fpjesma" name="_song" id="'+ song_info['path'] + '"' +'><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#"><h2>' + song_info["name"] + '</h2><p>' + song_info["artist"] + '</p></a></li>';
                }       
            }
            $("#ul_favorites").append(element);  
            $('#favorites').append(element);
            br = br + 1;             

        });
    }   
    $('#ul_favorites').append('<li><a class="ui-btn ui-btn-icon-right ui-icon-none" href="#favorite_page">more...</a></li>');

    $('.fpjesma').off();
    $('.fpjesma').on('click', function()
    {
        for (let i = 0; i < songs_info.length; i++) //prolazeci kroz popis detalja svih pjesama iz baze podataka trazimo podatke o pjesmi na koju je kliknuto
        {
            var el = songs_info[i];
            //console.log('this:',$(this).find("a").find("h2")[0].innerText);
            //console.log(el['artist']);

            if($(this).find("a").find("h2")[0].innerText == el['name'] && $(this).find("a").find("p")[0].innerText == el['artist']) 
            {
                document.getElementById('song_title').innerHTML = el['name']; //na stranici #song_page se postavlja naziv pjesme i ime izvodaca
                document.getElementById('song_artist').innerHTML = el['artist'];
                document.getElementById('btnsong').innerHTML = el['name'] + ' - ' + el['artist'];
                _audio.src = el['path'];  //postavljanje src atributa audio elementa na putanju odabrane pjesme koja je i id kliknutog elementa
                _audio.innerText = el['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();  //za odabranu pjesmu dohvatimo tekst 
                break;
            }
        }
        //console.log($(this).find("a").find("h2")[0].innerText);
        //console.log($(this).find("a").find("p")[0].innerText);

        window.location.href = "#song_page";
    })
}

//------------------------- METODE ZA NEXT I PREV SONG ------------------------------------------------------------------------------------------------
function songnext() //metoda koja se izvrsi klikom na btn next, reproducira sljedecu pjesmu sa popisa pjesama 
{
    for (let i = 0; i < songs_info.length; i++) 
    {
        if (songs_info[i]['path'] == _audio.innerText)  //u popisu pjesama pronadjemo pjesmu koja se trenutno izvodi
        {
            if ((i+1) == songs_info.length)  //ako je trenutna pjesma na kraju popisa pjesama onda se reproducira prva s popisa > songs_info[0]
            {
                document.getElementById('song_title').innerHTML = songs_info[0]['name'];
                document.getElementById('song_artist').innerHTML = songs_info[0]['artist'];
                document.getElementById('btnsong').innerHTML = songs_info[0]['name'] + ' - ' + songs_info[0]['artist'];
                _audio.src = songs_info[0]['path'];
                _audio.innerText = songs_info[0]['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();
                break;
                
            }
            else if ((i+1) < songs_info.length) //ako je indeks sljedece pjesme unutar duljine popisa pjesama, reproducira se pjesma na songs_info[i+1]
            { 
                document.getElementById('song_title').innerHTML = songs_info[i+1]['name'];
                document.getElementById('song_artist').innerHTML = songs_info[i+1]['artist'];
                document.getElementById('btnsong').innerHTML = songs_info[i+1]['name'] + ' - ' + songs_info[i+1]['artist'];

                _audio.src = songs_info[i+1]['path'];
                _audio.innerText = songs_info[i+1]['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();
                break;
            }
        }
    }
}
function songprevious() //metoda koja se izvrsi klikom na btn previous, reproducira prethodnu pjesmu sa popisa pjesama
{
   for (let i = 0; i < songs_info.length; i++) 
   {
        if (songs_info[i]['path'] == _audio.innerText) //u popisu pjesama pronadjemo koja se trenutno izvodi
        {
            if ((i-1) == -1) //ako indeks sljedece pjesme izlazi iz granica niza onda se reproducira pjesma s kraja niza > songs_info[songs_info.length - 1]
            {
                document.getElementById('song_title').innerHTML = songs_info[songs_info.length - 1]['name'];
                document.getElementById('song_artist').innerHTML = songs_info[songs_info.length - 1]['artist'];
                document.getElementById('btnsong').innerHTML = songs_info[songs_info.length - 1]['name'] + ' - ' + songs_info[songs_info.length - 1]['artist'];
                _audio.src = songs_info[songs_info.length - 1]['path'];
                _audio.innerText = songs_info[songs_info.length - 1]['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();
                break; 
            }
            else if ((i-1) >= 0 ) //ako u popisu pjesama postoji ona manjeg indeksa onda se ona reproducira > songs_info[i-1]
            {
                document.getElementById('song_title').innerHTML = songs_info[i-1]['name'];
                document.getElementById('song_artist').innerHTML = songs_info[i-1]['artist'];
                document.getElementById('btnsong').innerHTML = songs_info[i-1]['name'] + ' - ' + songs_info[i-1]['artist'];
                _audio.src = songs_info[i-1]['path'];
                _audio.innerText = songs_info[i-1]['path'];
                _audio.load();
                _audio.play();
                load_lyrics_from_api();
                break;
            }
        }
    }
}

//-------------------------API ZA TEKST PJESME---------------------------------------------------------------------------------------------------------
function load_lyrics_from_api() //metoda za dohvacanje teksta trenutno reproducirane pjesme
 {
    song_artist = document.getElementById('song_artist').innerHTML;
    song_title = document.getElementById('song_title').innerHTML;
    song_key = ''.concat(song_artist, song_title);

    if (localStorage.getItem(song_key) == null || localStorage.getItem(song_key) == '') //
    {
        //window.alert('from local storage');
        zahtjev = new XMLHttpRequest();
        zahtjev.onreadystatechange = metoda_api;
        // GET: 'https://orion.apiseeds.com/api/music/lyric/:artist/:track' 
        zahtjev.open('GET', ''.concat(api_url, song_artist, '/:', song_title, '?apikey=', api_key), true);
        zahtjev.send();
    }
    else //ako u lokalnom spremniku vec postoji spremljen tekst pjesme
    {
        //window.alert('from local storage');
        document.getElementById("lyrics").innerHTML = localStorage.getItem(song_key);
    }

}
function metoda_api() 
{
    //window.alert('metoda');
    if (zahtjev.readyState == 4)
    {
        //console.log('ready state 4');
        if (zahtjev.status == 200) 
        {
            //console.log('status 200');
            odgovor = JSON.parse(zahtjev.responseText);
            var t = odgovor.result.track.text;
            t = t.replace(/(\r\n|\n|\r)/gm, "<br>"); //zamjena oznaka za nove redove u oznake <br> za nove redove u Html-u
            document.getElementById("lyrics").innerHTML = t;
            localStorage.setItem(song_key, t); //spremi u lokalni spremnik tekst na key-u: izvodac+naziv pjesme
        }
        else if (zahtjev.status == 404)
        {
            //console.log('status 404');
            document.getElementById("lyrics").innerHTML = 
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '.......................................<br>'+
            '            lyrics not found           <br>'+ 
            '   check your song info and try again  '+
            '<br></br>';
        }
    }
}

/*--------------------------------------------- THE END -----------------------------------------------------------------------------------------------*/
/*-------------------------------- Josipa Juricic, PROMA, PMFST, 2019/20 ------------------------------------------------------------------------------*/