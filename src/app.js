$(function(){
    var socket = io();
    var user;
    var socket_id;
    var chnnel;
    var i=0;

  $('#message_container').on('click','.name',function(event){
    iziToast.show({
      title: event.target.textContent,
      timeout: 10000,
      message: 'Özel konuşma isteği gönder',
      buttons: [
        ['<button>EVET</button>', function(instance, toast, button, e, inputs){
          socket.emit('private_conv',{sender_name: user, reciever_id: event.target.classList[1], reciever_name: event.target.textContent});
          instance.hide({
              transitionOut: 'fadeOutUp'
            }, toast, 'evet');
        }
      ]
    ],
    position: 'topRight',
  });
  });

  socket.on('new_message', function(data){
    i=i+1;
    if (String(socket_id) === String(data.sender_id)) {
        $('#message_container').append($('<div class="bubble you">').text(data.message));
        $('#'+socket_id+i).append($('<i style="float: right;" class="far fa-user">'));
    }
    else {
      $('#message_container').append($('<div class="bubble me" id="'+data.sender_id+i+'">'));
      $('#'+data.sender_id+i).append($('<div id="'+data.sender_id+i+"msg"+'">'));
      $('#'+data.sender_id+i+"msg").append($('<i class="fas fa-user">'));
      $('#'+data.sender_id+i+"msg").append($('<b class="name '+data.sender_id+'">').text(data.sender_name));
      $('#'+data.sender_id+i).append($('<br>'));
      $('#'+data.sender_id+i).append(data.message);

    }
    window.scrollTo(0,document.body.scrollHeight);
  });
  socket.on('new_user', function(new_user){
    iziToast.success({
      title: new_user,
      message: 'çevrimiçi oldu!',
      position: 'topRight',
      timeout: 2500,
      icon: 'fas fa-globe',
    });
  });
  socket.on('connect', function(){
      socket_id = socket.id;
      chnnel = 'main_gate';
      iziToast.show({
        id: 'giris',
        toastOnce: true,
        title: 'GİRİŞ',
        timeout: false,
        overlay: true,
        theme: 'dark',
        zindex: 999,
        icon: 'icon-person',
        title: 'Hoşgeldiniz',
        message: 'Mesaj yazabilmek için lütfen sizi tanıtan bir isim giriniz!',
        position: 'center',
        drag: false,
        close: false,
        progressBarColor: 'rgb(0, 255, 184)',
        inputs: [
            ['<input type="text" placeholder="isim">', 'keyup', function (instance, toast, input, e) {
                console.info(input.value);
            }, true],
        ],
        buttons: [
            ['<button>Giriş</button>', function (instance, toast, button, e, inputs) {
              console.info(socket_id);
              if (inputs[0].value.length >= 3) {
                  user = inputs[0].value;
                  socket.emit('new_user', {new_user: user, channel: chnnel});
                  instance.hide({
                      transitionOut: 'fadeOutUp'
                      }, toast, 'Kapat');
                      document.title = chnnel;
              }
              else{
                iziToast.warning({
                  id: 'no_usr',
                  toastOnce: true,
                  title: 'Hata',
                  message: 'Kullanıcı ve Kanal isimleri en az 3 karakter olmalıdır!',
                  position: 'center',
                  timeout: 1000
                });
              }
            }, true]
        ],
        onOpening: function(instance, toast){
            console.info('İsim Bekleniyor!');
        },
        onClosing: function(instance, toast, closedBy){
            console.info('closedBy: ' + closedBy);
            iziToast.show({
              id: 'message_box',
              title: user,
              timeout: false,
              theme: 'dark',
              zindex: 999,
              position: 'bottomCenter',
              target: '.text_area',
              close: false,
              drag: false,
              toastOnce: true,
              inputs: [
                  ['<input type="text">', 'keyup', function (instance, toast, input, e) {
                      console.info(input.value);
                  }, true]
                ],
              buttons: [
                  ['<button>GÖNDER</button>', function(instance, toast, button, e, inputs){
                    if (inputs[0].value.length > 2) socket.emit('new_message', {sender_name: user, message: inputs[0].value, channel: chnnel});
                    else{
                        iziToast.warning({
                          id: 'no_msg',
                          title: 'Hata',
                          toastOnce: true,
                          message: 'Boş mesaj Gönderemezsiniz',
                          position: 'bottomCenter',
                          target: '#message_container',
                          timeout: 1000
                        });
                    }
                    inputs[0].value = " ";
                  },]
              ]
          });
          openNav();
        }
      });
  });
  socket.on('user_gone',function(username){
    iziToast.warning({
      title: username,
      message: 'çevrimdışı oldu!',
      position: 'topRight',
      timeout: 2500,
      icon: 'fas fa-walking',
    });
  });
  socket.on('private_conv',function(data){
    iziToast.show({
      title: 'Özel konuşma isteği',
      message: data.sender_name+" adlı kişi size özel konuşma isteği gönderdi!",
      position: 'topRight',
      timeout: 10000,
      icon: 'far fa-envelope',
      buttons: [
        ['<button>Kabul Et</button>',function(instance, toast, button, e){
          socket.emit('private_conv_resp',{response: " adlı kişi özel konuşma isteğinizi kabul etti.", reciever_id: data.sender_id, sender_name: user});
          instance.hide({
              transitionOut: 'fadeOutUp'
              }, toast, 'Kapat');
        }],
        ['<button>Reddet</button>', function(instance, toast, button, e){
          socket.emit('private_conv_resp',{response: " adlı kişi özel konuşma isteğinizi reddetti.", reciever_id: data.sender_id, sender_name: user});
          instance.hide({
              transitionOut: 'fadeOutUp'
              }, toast, 'Kapat');
        }],
      ],
    });
  });
  socket.on('private_conv_resp', function(data){
    iziToast.show({
      id: 'response',
      toastOnce: true,
      icon: 'far fa-envelope-open',
      message: data.sender_name+data.response,
      position: 'topRight',
      buttons: [
        ['<button>Konuşmayı Başlat</button>', function(instance, toast, button, e){
          alert("bu özellik için biraz bekleyeceksiniz :)");
        }]
      ]
    })
  });
  socket.on('clear_list',function(){
    $('#mySidenav').empty();
    $('#mySidenav').append($('<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">').text('X'));
  });
  socket.on('update_channel_list', function(channel){
    if(chnnel == channel){
      iziToast.show({
        id: channel,
        target: '.sidenav',
        title: channel,
        message: 'Şu an bu kanaldasınız',
        toastOnce: true,
        timeout: false,
        close: false,
      });
    }
    else {
      iziToast.show({
        id: channel,
        target: '.sidenav',
        title: channel,
        toastOnce: true,
        timeout: false,
        close: false,
        buttons: [
          ['<button>Geçiş yap</button>', function(instance, toast, button, e){
            socket.emit('switch_channel',{username: user, new_channel: channel, current_channel: chnnel});
            chnnel = channel;
            $('#message_container').empty();
            document.title = chnnel;
            closeNav();
          }]
        ]
      });
    }
  });
  function new_channel(){
    iziToast.show({
      id: 'new_channel',
      toastOnce: true,
      title: 'Yeni Kanal',
      message: 'Lütfen yeni kanal için bir isim giriniz.',
      position: 'topLeft',
      timeout: false,
      inputs: [
          ['<input type="text" placeholder="kanal adı">', 'keyup', function (instance, toast, input, e) {
              console.info(input.value);
          }, true]
        ],
      buttons: [
          ['<button>Kanal Aç</button>', function(instance, toast, button, e, inputs){
            if (inputs[0].value.length > 2) socket.emit('new_channel', inputs[0].value);
            else{
                iziToast.warning({
                  id: 'no_msg',
                  title: 'Hata',
                  toastOnce: true,
                  message: 'Kanal adı en 3 karakter içermelidir!',
                  position: 'topLeft',
                  timeout: 1000
                });
            }
            instance.hide({
                transitionOut: 'fadeOutUp'
                }, toast, 'Kapat');
          },]
      ]

    });
  }
  $('#newChannel').on('click', function(){
    new_channel();
  });

});
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = "white";
}
