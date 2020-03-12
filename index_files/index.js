var token = sessionStorage.getItem('token');
var _userId = sessionStorage.getItem('userid') || '';
var _isShowDownload = true;
var _user = sessionStorage.getItem('user') || '';
function checkUser(){
  var user = sessionStorage.getItem('user');
  var token = sessionStorage.getItem('token');
  var company = sessionStorage.getItem('company');
  if(user && token){
    $(".userbox").remove();
    $("#userPhone").text(user)
    $(".userinfobox").show();
    if(!company || company=="null"){
      fillCompany();
    }
    if(_isShowDownload){
      showDownload();
    }
    $(".nav-downdata").show();
    showTips();
    return true
  }else{
    $(".userbox").show();
    return false;
  }
}

function showTips(){
  var isshow = localStorage.getItem('showtip');
  if(isshow != '3'){
    $("#tipBox").css('display','flex');
    $("#tip").fadeIn();
  }
}

function getRanking(subject,target){
  var formatFn = function(r){
    var h = '';
    if(r.length>0){
      $.each(r,function(n,v){
          h +='<li>'
          h +='  <span class="ranking-width-1">'+(n+1)+'</span>'
          h +='  <span class="ranking-width-2">'+v.team+'</span>'
          h +='  <span class="ranking-width-3">'+v.score+'</span>'
          h +='  <span class="ranking-width-4">'+v.newScore+'</span>'
          h +='</li>'
      })
      $("#"+target).append(h).show();
      $("#"+target).next('.ranking-nodata').hide();
    }
  }
  $.ajax({
    url:_BASEURL+'/user/raning/raningList/'+subject+'/0/400',
    type:'get',
  }).done(function(r){
    if(r.code == 2000){
      formatFn(r.data.list)
    }else{
      alert('获取排行数据失败，请重试');
    }
  })
}

$(function(){
  checkUser()
  getRanking(1,"ranking-face")
  getRanking(2,"ranking-person")
  getRanking(3,"ranking-abnormal")
  token && checkMsg();
})


$("#toTop").click(function(){
  $(window).scrollTop(0)
})
$("[data-id=closePopBox]").click(function(){
  $("#popBox").fadeOut(function(){
    $("#regTitle").text('注册');
    $("#resetPswBtn").hide();
    $("#regBtn").show();
    $("#regBox").hide();
    $("#loginBox").hide();
  })
})
$("#user").click(function(){
  $("#popBox").css('display','flex')
  $("#loginBox").fadeIn()
})
$("#reg").click(function(){
  $("#popBox").css('display','flex')
  $("#regBox").fadeIn()
})
var t = null;
$("#getVcode").click(function(){
  var phone = $("#reg-phone").val();
  var time = 60;
  $("#getVcode").html(time).attr('disabled','disabled')
  $.ajax({
    url:_BASEURL+'/user/prelogin/getPhoneCode?phone='+phone,
    type:'get',
    success:function(r){
      console.log(r)
      t = setInterval(function(){
        if(time>1){
          time--;
          $("#getVcode").html(time)
        }else{
          $("#getVcode").html('发送验证码').removeAttr('disabled')
          clearInterval(t)
          t = null
        }
      },1000)
    },
    error:function(){
      $("#getVcode").html('发送验证码').removeAttr('disabled')
    }
  })
  
})

$("#reg-phone").change(function(){
  var v = $(this).val();
  if(v && v.length==11){
    $("#getVcode").removeAttr('disabled')
  }else{
    $("#getVcode").attr('disabled','disabled')
  }
});

$("#regBtn,#resetPswBtn").click(function(){
  var id = $(this).attr('id');
  var phone = $("#reg-phone").val(),
      mail = $("#reg-mail").val(),
      company = $("#reg-company").val(),
      psw1 = $("#reg-psw").val(),
      psw2 = $("#pswc").val(),
      vcode = $("#vCode").val(),
      agreement = $("#reg-agreement").prop('checked');
  if(!phone || phone.length != 11){
    alert('请正确填写您的手机号');
    return;
  }
  if(id=="regBtn" && !mail){
    alert('请输入您的邮箱地址');
    return;
  }
  if(id=="regBtn" && !company){
    alert('请输入您的单位名称');
    return;
  }
  if(!psw1 || psw1.length<8){
    alert('请输入密码，最少8位');
    return;
  }else if(psw1 != psw2){
    alert('两次输入的密码不一致')
    return;
  }else if(!vcode){
    alert('请输入验证码');
    return;
  }
  
  var regFn = function(){
    $.ajax({
      url:_BASEURL+'/user/prelogin/registerUser',
      type:'post',
      data:{
        phone:phone,
        password:psw1,
        company:company,
        email:mail,
        code:vcode
      },
      success:function(r){
        if(r.code==2000){
          $("#regBox [data-id=closePopBox]").trigger('click')
          alert('注册成功，请登录')
        }else{
          alert(r.message)
        }
      }
    })
  };
  var resetPswFn = function(){
    $.ajax({
      url:_BASEURL+'/user/prelogin/changePassword',
      type:'post',
      data:{
        phone:phone,
        code:vcode,
        newPassword:psw1
      },
      success:function(r){
        if(r.code==2000){
          $("#regBox [data-id=closePopBox]").trigger('click')
          alert('重置密码成功，请登录')
        }else{
          alert(r.message)
        }
      }
    })
  }
  if(id=="regBtn"){
    if(!agreement){
      alert('请阅读并同意《参赛协议》');
      return;
    }
    regFn();
  }else{
    resetPswFn();
  }
})
function checkMsg(token){
  if(!token){
    var token = sessionStorage.getItem('token');
  }
  var url = _BASEURL + '/user/message/messageList';
  $.ajax({
    url:url,
    type:'get',
    headers:{'Token':token},
  }).done(function(r){
    if(r.code == 2000 && r.data.unReadCount != 0){
      $(".msg sup").show();
    }
  })
}
$("#loginBtn").click(function(){
  var phone = $("#login-phone").val(),
      psw1 = $("#login-psw").val();
  if(!phone || phone.length != 11){
    alert('请正确填写您的手机号');
    return;
  }else if(!psw1){
    alert('请输入密码');
    return;
  }
  $.ajax({
    type:'post',
    url:_BASEURL+'/user/prelogin/login',
    data:{
      loginname:phone,
      password:psw1
    }
  }).done(function(res){
    if(res.code==2000){
      sessionStorage.setItem('token',res.data.token)
      sessionStorage.setItem('user',res.data.user.phone)
      sessionStorage.setItem('userid',res.data.user.userId)
      sessionStorage.setItem('company',res.data.user.recommendCompany)
      sessionStorage.setItem('checkStatus1',res.data.user.checkStatus1)
      sessionStorage.setItem('checkStatus2',res.data.user.checkStatus2)
      sessionStorage.setItem('checkStatus3',res.data.user.checkStatus3)
      token = res.data.token;
      _userId = res.data.user.userId;
      _user = res.data.user.phone;
      if(!res.data.user.recommendCompany){
        fillCompany();
      }else{
        $("#loginBox [data-id=closePopBox]").trigger('click');
      }
      checkUser();
      checkMsg(res.data.token);
    }else{
      alert(res.message)
    }
  })
})

$("#goLogin").click(function(){
  $("#regBox").hide();
  $("#loginBox").show();
})
$("#goReg").click(function(){
  $("#regTitle").text('注册');
  $("#resetPswBtn").hide();
  $("#reg-phone,#reg-mail,#reg-company,#reg-psw,#pswc,#vCode").val('');
  $("#reg-mail-box").show();
  $("#reg-company-box").show();
  $("#regBtn").show();
  $("#regBox").show();
  $("#loginBox").hide();
  $("#agreement").show();
})
$("#goResetPsw").click(function(){
  $("#regTitle").text('找回密码')
  $("#resetPswBtn").show();
  $("#reg-phone,#reg-psw,#pswc,#vCode").val('');
  $("#regBtn").hide();
  $("#reg-mail-box").hide();
  $("#reg-company-box").hide();
  $("#regBox").show();
  $("#loginBox").hide();
  $("#agreement").hide();
})

function showSignUp(subject){
  var type = 0;
  switch(subject){
    case 'face':
      $("#signUpSubjectTxt").text('人脸识别');
    break;
    case 'auto':
      $("#signUpSubjectTxt").text('车辆识别');
    break;
    case 'person':
      $("#signUpSubjectTxt").text('远距离行人身份认证');
    break;
    case 'abnormal':
      $("#signUpSubjectTxt").text('异常行为检测');
    break;
    default:;
  }
  var isLogin = checkUser();
  if(isLogin){
    $("#signUpBox").css('display','flex');
    $("#signUp").fadeIn()
  }else{
    $("#popBox").css('display','flex')
    $("#loginBox").fadeIn()
  }
  
};

function showDetail(subject){
  switch(subject){
    case 'face':
      $("#subjectFace").fadeIn();
    break;
    case 'auto':
      $("#subjectAuto").fadeIn();
    break;
    case 'person':
      $("#subjectPerson").fadeIn();
    break;
    case 'abnormal':
      $("#subjectAbnormal").fadeIn();
    break;
    default:;
  }
  $("#subjectBox").css('display','flex');
}

$("[data-id=closeSignUpBox]").click(function(){
  $("#signUpBox").fadeOut()
})
$("[data-id=closePanBox]").click(function(){
  $("#panBox").fadeOut()
})

$("[data-id=closeSubjectBox]").click(function(){
  $("#subjectFace,#subjectPerson,#subjectAuto,#subjectAbnormal,#subjectBox").fadeOut()
})

function fillCompany(){
  $("#popBox").css('display','flex')
  $("#loginBox").hide()
  $("#companyBox").show()
}
$("#companyBtn").click(function(){
  var company = $("#companyInput").val();
  if(company){
    $.ajax({
      type:'post',
      url:_BASEURL+'/user/user/addCompany',
      headers:{'Token':token},
      data:{
        id:_userId,
        company:company
      }
    }).done(function(res){
      if(res.code==2000){
        sessionStorage.setItem('company',company)
        $("#popBox").fadeOut(function(){
          $("#companyBox").hide();
        })
      }
    })
  }
})

function showDownload(){
  var c1 = sessionStorage.getItem('checkStatus1')
  var c2 = sessionStorage.getItem('checkStatus2')
  var c3 = sessionStorage.getItem('checkStatus3')
  if(c1 == '1'){
    $('.s1 .fg').show();
    $('.s1 .downdate').show();
    $('.s1 .submit').show();
  }
  if(c2 == '1'){
    $('.s2 .fg').show();
    $('.s2 .downdate').show();
    $('.s2 .submit').show();
  }
  if(c3 == '1'){
    $('.s4 .fg').show();
    $('.s4 .downdate').show();
    $('.s4 .submit').show();
  }
}

$("input[type=file]").change(function(e){
  var file = e.target.files[0];
  var subject = e.target.name;
  var formDate = new FormData();
  formDate.append('phone',_user);
  formDate.append('courseType',subject);
  formDate.append('file1',file);

  $("#loading").show();

  $.ajax({
    url:_BASEURL+'/user/user/testUploadFile',
    type:'post',
    contentType:false,
    headers:{'Token':token},
    data:formDate,
    processData:false,
    // dataType:"json",
    async: false,
    cache: false,
  }).done(function(r){
    if(r.code == 2000){
      alert('提交成功！')
    }else{
      alert("提交失败,请重试")
    }
    $("#loading").hide();
    // getData(1)
  })
})
function logout(){
  sessionStorage.clear();
  location.reload();
}
function download(type){
  $.ajax({
    url:_BASEURL+'/user/user/downPath/'+type,
    type:'get',
    headers:{'Token':token}
  }).done(function(r){
    if(r.code == 2000 && r.data){
      $("#pan-path a").attr('href',r.data.path)
      $("#pan-psw span").text(r.data.password);
      $("#pan-unzippsw span").text(r.data.filePwd)
      $("#pan").fadeIn()
    }else{
      alert('获取地址失败，请重试');
      $("#panBox,#pan").hide();
    }
  })
  $("#panBox").css('display','flex');
}
$("#tips-ok").click(function(){
  localStorage.setItem('showtip','3')
  $("#tipBox").fadeOut()
})