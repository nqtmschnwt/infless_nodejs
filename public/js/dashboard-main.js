var socket = io('https://infless-copy-trade-clone-001.herokuapp.com/', { transport : ['websocket'] });

var ddk = document.getElementById('ddk'),
ddkTable = document.getElementById('ddk-table'),
clientDK = document.getElementById('vol21DK');
var dieukien = [];
var m = new Date();
var v = '3.0.1';

function phongthanHide(ticker,id){
  if(document.getElementById(ticker+'-phongthan-'+id)!= null){
      document.getElementById(ticker+'-phongthan-'+id).style.display = "none";
  }
}

function dieukien_remove(ticker,id){
  for(var i = 0; i < dieukien.length; i++) {
    if(dieukien[i]['ticker']==ticker && dieukien[i]['id']==id) {
      //console.log("Remove",ticker,id);
      dieukien.splice(i, 1);
    }
  }
}

function addZero(numb) {
  if(numb<10){
    return "0"+numb;
  } else {
    return ""+numb;
  }
}

function numberFormat(x) {
    x = Number(x.replace(" ",""));
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

document.getElementById("loading").style.display="none";

/*window.onload = function() {
  //var dt = m.getFullYear() +"-"+ addZero(m.getMonth()+1) +"-"+ addZero(m.getDate()) ;
  //socket.emit('vol21Reset', {'DateTime':dt});
  document.getElementById('sidebar').click();
};*/

let dk = [];
let dbkl = [];

// Listen for events
socket.on('vol21', function(data){
  //Update DBKL
  //console.log(data);
  if(document.getElementById(data['ticker']+"-pt-dbkl")!= null){
    document.getElementById(data['ticker']+"-pt-dbkl").innerHTML = data['volDB'] + " %";
    if(dbkl.length==0) {
      dbkl.push({'ticker':data['ticker'],'volDB':data['volDB']});
    } else {
      let dbklCount = 0;
      for (var i = 0; i < dbkl.length; i++) {
        if(dbkl[i].ticker == data['ticker']) {
          dbkl[i].volDB = data['volDB'];
          dbklCount += 1;
          break;
        }
      }
      if(dbklCount==0) {
        dbkl.push({'ticker':data['ticker'],'volDB':data['volDB']});
      }
    }
  }

  if(dk.length>0){
    for(var i = 0; i < dk.length; i++) {
        if(dk[i]._ticker == data.ticker){
          console.log(data);
          if (parseFloat(data.price)>parseFloat(dk[i]._dk_price)){
            if(document.getElementById("dk"+dk[i].id)== null)
            {
              document.getElementById("ddk-noti").classList.add("ddk-noti-active");
              if(document.getElementById(data.ticker+"-noti")== null)
              {
                clientDK.innerHTML += '<div id="'+ data.ticker +'-noti" class="alert fade alert-simple alert-success alert-dismissible text-left font__family-montserrat font__size-16 font__weight-light brk-library-rendered rendered show">'+
                  '<i class="start-icon fa fa-info-circle faa-tada animated"></i>'+
                  '<strong class="font__weight-semibold">'+ data.ticker +'</strong>: giá vượt điều kiện.'+
                '</div>';
                playSound("trade");

                if(!document.getElementById("vol21DK").classList.contains("ddk-noti-active")) {
                  document.getElementById("ddk-noti").classList.add("ddk-noti-active");
                }
              }
            }
          }
          if (parseFloat(data.vol.replace(' ',''))>parseFloat(dk[i]._dk_vol)){
            if(document.getElementById("dk"+dk[i].id)== null)
            {
              document.getElementById("ddk-noti").classList.add("ddk-noti-active");
              if(document.getElementById(data.ticker+"-noti")== null)
              {
                clientDK.innerHTML += '<div id="'+ data.ticker +'-noti" class="alert fade alert-simple alert-success alert-dismissible text-left font__family-montserrat font__size-16 font__weight-light brk-library-rendered rendered show">'+
                  '<i class="start-icon fa fa-info-circle faa-tada animated"></i>'+
                  '<strong class="font__weight-semibold">'+ data.ticker +'</strong>: khối lượng vượt điều kiện.'+
                '</div>';
                playSound("trade");

                if(!document.getElementById("vol21DK").classList.contains("ddk-noti-active")) {
                  document.getElementById("ddk-noti").classList.add("ddk-noti-active");
                }
              }
            }
          }
          if (parseFloat(data.price)<parseFloat(dk[i]._sl_price)*1.02 && parseFloat(data.price)>=parseFloat(dk[i]._sl_price)){
            if(document.getElementById("dk"+dk[i].id)== null)
            {
              document.getElementById("ddk-noti").classList.add("ddk-noti-active");
              if(document.getElementById(data.ticker+"-danger-noti")== null)
              {
                clientDK.innerHTML += '<div id="'+ data.ticker +'-danger-noti" class="alert fade alert-simple alert-danger alert-dismissible text-left font__family-montserrat font__size-16 font__weight-light brk-library-rendered rendered show">'+
                  '<i class="start-icon fa fa-info-circle faa-tada animated"></i>'+
                  '<strong class="font__weight-semibold">'+ data.ticker +'</strong>: sắp chạm cắt lỗ.'+
                '</div>';
                playSound("trade");

                if(!document.getElementById("vol21DK").classList.contains("ddk-noti-active")) {
                  document.getElementById("ddk-noti").classList.add("ddk-noti-active");
                }
              }
              // Change backgroundColor
              if(document.getElementById(dk[i]._ticker+"-phongthan-"+dk[i].id)!=null)
                document.getElementById(dk[i]._ticker+"-phongthan-"+dk[i].id).style.backgroundColor='#ff000066';
            }
          }
          break;
        }
    }
  }

});

// Kick
socket.on('kick', function(data){
  var kickWhom = data.usrnm;
  if (kickWhom == usr) {
    console.log("You are kicked!");
    location.href = '<?php home_url() ?>/copy-trade-logout/';
  }
});

socket.on('canhbao', function(data){
  var canhbaoSwitch = data.sw;
  var canhbaoMessage = data.msg;
  if(canhbaoSwitch=="on"){
    playSound("warn");
    console.log(data);
    document.documentElement.style.setProperty('--canhbaoCol1', data.color1);
    document.documentElement.style.setProperty('--canhbaoCol11', data.color1+"16");
    document.documentElement.style.setProperty('--canhbaoCol2', data.color2);
    document.documentElement.style.setProperty('--canhbaoCol21', data.color2+"16");
    document.documentElement.style.setProperty('--canhbaoCol3', data.color3);
    document.documentElement.style.setProperty('--canhbaoCol31', data.color3+"16");
    document.documentElement.style.setProperty('--canhbaoCol4', data.color4);
    document.documentElement.style.setProperty('--canhbaoCol41', data.color4+"16");
    document.documentElement.style.setProperty('--canhbaoCol5', data.color5);
    document.documentElement.style.setProperty('--canhbaoCol51', data.color5+"16");

    switch(data.color_num) {
      case "1":
        document.getElementById('canhbao-inner').style.animation = "blink-1 infinite both";
        document.getElementById('canhbao-inner').style.webkitAnimation = "blink-1 infinite both";
        break;
      case "2":
        document.getElementById('canhbao-inner').style.animation = "blink-2 infinite both";
        document.getElementById('canhbao-inner').style.webkitAnimation = "blink-2 infinite both";
        break;
      case "3":
        document.getElementById('canhbao-inner').style.animation = "blink-3 infinite both";
        document.getElementById('canhbao-inner').style.webkitAnimation = "blink-3 infinite both";
        break;
      case "4":
        document.getElementById('canhbao-inner').style.animation = "blink-4 infinite both";
        document.getElementById('canhbao-inner').style.webkitAnimation = "blink-4 infinite both";
        break;
      case "5":
        document.getElementById('canhbao-inner').style.animation = "blink-5 infinite both";
        document.getElementById('canhbao-inner').style.webkitAnimation = "blink-5 infinite both";
        break;
      default:
        document.getElementById('canhbao-inner').style.animation = "blink-1 infinite both";
        document.getElementById('canhbao-inner').style.webkitAnimation = "blink-1 infinite both";
        // code block
    }
    document.getElementById('canhbao-inner').style.animationDuration = 5/(parseInt(data.speed)/100)+"s";

    document.getElementById('canhbao').style.display = "block";
    document.getElementById('canhbaoMsg').innerHTML = canhbaoMessage;
  }
  if(canhbaoSwitch=="off"){
    document.getElementById('canhbao').style.display = "none";
  }
});

// Query DOM
var output = document.getElementById('output');
var modalOutput = document.getElementById('modal-msg');
var myNav = +document.getElementById('mynav').innerHTML.replace(/\,/g, '');
var modal = document.getElementById("myModal");
var usr = document.getElementById("user").innerHTML;

// Generate favicon badge
var favicon = new Favico({
animation :'none',
bgColor   :'#dd2c00',
textColor :'#fff0e2'
});

var num = 0;
function generateNum() {
  num++;
  return num;
}

// Time format
function checkTime(i) {
  if (i < 10) {
  i = "0" + i;
  }
  return i;
}

function vnDateFormat(dateStr) {
  let dateFormatter = new Intl.DateTimeFormat("vi-VN");
  return dateFormatter.format(Date.parse(dateStr)).replace(/\b(\d\/)/g,'0$1');
}

// Sounds
const audioTrade = new Audio("/assets/mp3/pristine-609.mp3");
const audioWarn = new Audio("/assets/mp3/warn.mp3");

// Notification sound
function playSound(s) {
  if(s=="trade")
  audioTrade.play();
  if(s=="warn")
  audioWarn.play();
}

// Handling copy ratio
function newVol(fNav, mNav, fVol){
var Vol = Math.floor(mNav/fNav*fVol/100)*100;
return Vol;
}

// Listen for events
socket.on('trade', function(data){

    // Handling time
    var m = new Date();
    var dt = addZero(m.getDate()) +"/"+ addZero(m.getMonth()+1) +"/"+ m.getFullYear()  + " " + addZero(m.getHours()) + ":" + addZero(m.getMinutes()) + ":" + addZero(m.getSeconds());

    // Handling Nav
    var fundnav = +data.fundnav;
    var fundvol = +data.vol;
    var order="";
    if (data.order=="buy"){
      order="Mua";
    } else if (data.order=="sell") {
      order="Bán";
    }

    var prz='';
    var odrtp = data.ordertype;
    if(odrtp.toUpperCase()!='LO'){
      prz=odrtp;
    } else {
      prz=data.price
    }

    var neuVol = newVol(fundnav,clientNav,fundvol).toString();

    console.log(data,neuVol);

    if (neuVol>0 && order!="")
    {
      neuVol = neuVol.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      let intradayCache = intraday.innerHTML;
      intraday.innerHTML = '<p class="order-msg"><span class="text-secondary mr-2">' + dt + ': </span><strong>' + order + " " + neuVol + " " + data.symbol.toUpperCase() + " giá " + prz + '</strong></p>';
      intraday.innerHTML += intradayCache;
    }
    if (data.pct!=null && data.pct!=''){
      let intradayCache = intraday.innerHTML;
      intraday.innerHTML = '<p class="order-msg"><span class="text-secondary mr-2">' + dt + ': </span><strong>' + order + " " + data.pct + "% " + data.symbol.toUpperCase() + " giá " + prz + '</strong></p>';
      intraday.innerHTML += intradayCache;
    }
});

socket.on('ID', function(data){
  console.log("Socket iD:",data);
});

socket.on('phongThan',function(data){
  console.log('phong than: ',data);
  let bangPhongThan = document.getElementById("bangPhongThan");
  if(bangPhongThan!=null){
    if(data.length==0) {
      bangPhongThan.innerHTML="<i class='text-secondary'>Danh sách đang trống</i>";
    } else {
      dk = data;
      let bangPhongThanBegin = "<table style='margin-top:30px;width:100%'><tr>"+
                "<th class='text-center'>Ngày thêm vào</th>"+
                "<th class='text-center'>Mã</th>"+
                "<th class='text-center'>Giá điều kiện</th>"+
                "<th class='text-center'>KL điều kiện</th>"+
                "<th class='text-center'>Giá cắt lỗ</th>"+
                "<th class='text-center'>ĐBKL</th>"+
                "<th class='text-center'>Form</th></tr>";
      let bangPhongThanEnd = "</table>";
      for(var i = 0; i < data.length; i++) {
        let dotbien = 'loading...';
        for(var j = 0; j<dbkl.length; j++) {
          //console.log(data[i]._ticker,dbkl[j].ticker,(data[i]._ticker == dbkl[j].ticker))
          if(data[i]._ticker == dbkl[j].ticker) {
            dotbien = dbkl[j].volDB+" %";
          }
        }
        bangPhongThanBegin += "<tr id='"+data[i]._ticker+"-phongthan-"+data[i].id+"'>"+
                "<td class='text-center'>"+vnDateFormat(data[i]._add_date)+"</td>"+
                "<td class='text-center'>"+data[i]._ticker+"</td>"+
                "<td class='number-mid'>"+data[i]._dk_price+"</td>"+
                //"<td class='number-mid'>"+numberFormat((parseFloat(data[i]._dk_vol)*1000000).toString())+"</td>"+
                "<td class='number-mid'>"+(parseFloat(data[i]._dk_vol)*1000000).toLocaleString('en')+"</td>"+
                "<td class='number-mid'>"+data[i]._sl_price+"</td>"+
                "<td id='"+data[i]._ticker+"-pt-dbkl' class='text-center'>"+dotbien+"</td>"+
                "<td class='number-mid'>"+data[i]._form+"</td></tr>";
      }
      bangPhongThan.innerHTML=bangPhongThanBegin+bangPhongThanEnd;
    }
  }
});

socket.on('DK', function(data){
  let bangDieuKien = document.getElementById("bangDK");
  if(bangDieuKien!=null){
    if(data.length==0) {
      bangDieuKien.innerHTML="<i class='text-secondary'>Danh sách đang trống</i>";
    } else {
      console.log('dk: ',data);
      let bangDKBegin = "<table id='ddk-table' style='margin-top:30px;width:100%'><tr>"+
        "<th class='text-center'>Thời gian</th>"+
        "<th class='text-center'>Mã</th>"+
        "<th class='text-center'>Giá điều kiện</th>"+
        "<th class='text-center'>Khối lượng điều kiện</th>"+
        "<th class='text-center'>Form</th></tr>";
      let bangDKEnd = "</table>";
      for(var i = 0; i < data.length; i++) {
          bangDKBegin += "<tr id='dk-"+data[i].id+"'>"+
            "<td class='text-center' id='date-"+data[i].id+"'>"+vnDateFormat(data[i]._passed_time)+"</td>"+
            "<td class='text-center' id='ticker-"+data[i].id+"'>"+data[i]._ticker+"</td>"+
            "<td class='number-mid' id='price-"+data[i].id+"'>"+data[i]._dk_price+"</td>"+
            //"<td class='number-mid' id='vol-"+data[i].id+"'>"+numberFormat((parseFloat(data[i]._dk_vol)*1000000).toString())+"</td>"+
            "<td class='number-mid' id='vol-"+data[i].id+"'>"+(parseFloat(data[i]._dk_vol)*1000000).toLocaleString('en')+"</td>"+
            "<td class='number-mid' id='form-"+data[i].id+"'>"+data[i]._form+"</td></tr>";
      }
      bangDieuKien.innerHTML=bangDKBegin+bangDKEnd;
    }
  }
});

socket.on('SL', function(data){
  let bangCatLo = document.getElementById("bangCatLo");
  if(bangCatLo!=null){
    if(data.length==0) {
        bangCatLo.innerHTML="<i class='text-secondary'>Danh sách đang trống</i>";
    } else {
      console.log("sl: ", data);
      let bangCatLoBegin = "<table style='width:100%'><tr>"+
        "<th class='text-center'>Thời gian</th>"+
        "<th class='text-center'>Mã</th>"+
        "<th class='text-center'>Giá cắt lỗ</th></tr>";
      let bangCatLoEnd = "</table>";
      for(var i = 0; i < data.length; i++) {
          bangCatLoBegin += "<tr id='dk-"+data[i].id+"'>"+
            "<td class='text-center' id='date-"+data[i].id+"'>"+vnDateFormat(data[i]._sl_time)+"</td>"+
            "<td class='text-center' id='ticker-"+data[i].id+"'>"+data[i]._ticker+"</td>"+
            "<td class='number-mid' id='sl-"+data[i].id+"'>"+data[i]._sl_price+"</td></tr>";
      }
      bangCatLo.innerHTML=bangCatLoBegin+bangCatLoEnd;
    }
  }
});
