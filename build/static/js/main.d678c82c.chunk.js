(this.webpackJsonpnewblog=this.webpackJsonpnewblog||[]).push([[0],{262:function(e,n,t){e.exports=t(720)},720:function(e,n,t){"use strict";t.r(n);var a=t(0),r=t.n(a),c=t(18),o=t.n(c),i=t(38),l=t(24),u=t(4),f=t(5),m=t(71),d={GITHUB:"https://github.com/k27dong",LINKEDIN:"https://www.linkedin.com/in/k27dong/",MAIL:"mailto:me@kefan.me",CIBC:"https://www.cibc.com/",UWENG:"https://uwaterloo.ca/engineering/",SAFYRELABS:"https://www.safyrelabs.com/",POINTCLICKCARE:"https://pointclickcare.com",HOST:"http://localhost:5000/",CURRENTYEAR:(new Date).getFullYear(),BUYMECOFFEE:"https://www.buymeacoffee.com/kefan",WHOAMI:"Kefan Dong",ZHIHU:"https://www.zhihu.com/people/csbt34d",RESUME:"".concat("","/Kefan_Dong_Resume_PDF.pdf"),DEPLOYMENT_HOST:"https://k27dong-website.herokuapp.com/"},b=function(e,n){try{return"post"===n?"".concat(e.getFullYear(),"/").concat(e.getMonth()+1,"/").concat(e.getDate()):"main"===n?"".concat(e.getDate(),", ").concat(["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][e.getMonth()]):""}catch(t){return""}},p=function(){var e=Date.now()-new Date("April 3, 2000 12:00:00"),n=new Date(e);return Math.abs(n.getUTCFullYear()-1970)},s=t(120),g=t(226),E=t.n(g);function h(){var e=Object(u.a)(["\n  font-size: 16px;\n"]);return h=function(){return e},e}var v=f.a.p(h()),x=function(e){return r.a.createElement("a",{href:e.url,target:"_blank",rel:"noopener noreferrer"},e.text)},O=function(){return r.a.createElement(v,null,r.a.createElement(x,{url:d.UWENG,text:"University of Waterloo"}),", Previously ",r.a.createElement(x,{url:d.CIBC,text:"Autodesk"}),","," ",r.a.createElement(x,{url:d.POINTCLICKCARE,text:"BetterUp"}),", ",r.a.createElement(x,{url:d.SAFYRELABS,text:"PointClickCare"}),","," ",r.a.createElement(x,{url:d.SAFYRELABS,text:"Safyre Labs"}),","," ")};t(176);function w(){var e=Object(u.a)(["\n  margin-right: 12px;\n  width: 80px;\n"]);return w=function(){return e},e}function k(){var e=Object(u.a)(["\n  position: absolute;\n  top: 30%;\n  margin-left: 5%;\n"]);return k=function(){return e},e}function j(){var e=Object(u.a)(['\n  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial,\n    sans-serif;\n  font-weight: bold;\n  font-size: 3rem;\n  line-height: 1.25;\n  letter-spacing: -0.1rem;\n  color: black;\n  margin-bottom: 15px;\n']);return j=function(){return e},e}var y=f.a.p(j()),_=f.a.div(k()),C=Object(f.a)(m.a)(w()),S=Object(l.g)((function(e){var n=function(n){switch(n){case"about":e.history.push("/about");break;case"blog":e.history.push("/blog");break;case"github":window.open(d.GITHUB,"_blank");break;case"linkedin":window.open(d.LINKEDIN,"_blank");break;case"resume":window.open(d.RESUME,"_blank");break;default:console.log("error")}};return r.a.createElement(r.a.Fragment,null,r.a.createElement(E.a,{target:"_blank",href:"https://github.com/k27dong/mywebsite"}),r.a.createElement(_,null,r.a.createElement(y,null,"Kefan Dong"),r.a.createElement(O,null),r.a.createElement(C,{onClick:function(){return n("about")}},"About"),r.a.createElement(C,{onClick:function(){return n("github")}},"Github"),r.a.createElement(C,{onClick:function(){return n("linkedin")}},"LinkedIn"),s.isBrowser&&r.a.createElement(C,{onClick:function(){return n("resume")}},"Resume"),r.a.createElement(C,{onClick:function(){return n("blog")}},"Blog")))})),F=t(30),H=t(52),N=t.n(H),I=t(728);function M(){var e=Object(u.a)(["\n      text-align: right;\n      width: 100px;\n      padding-right: 30px;\n\n      @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {\n        width: 68px;\n        padding-right: 14px;\n      }\n    "]);return M=function(){return e},e}function A(){var e=Object(u.a)(["\n      display: block;\n      color: inherit;\n      -webkit-text-decoration: none;\n      text-decoration: none;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      white-space: nowrap;\n      padding: 0.4em;\n      height: 100%;\n      width: 100%;\n      font-size: large;\n\n      &:hover {\n        text-decoration: none;\n        color: inherit;\n      }\n    "]);return A=function(){return e},e}function D(){var e=Object(u.a)(["\n      -webkit-flex: 5;\n      -ms-flex: 5;\n      flex: 5;\n      min-width: 0;\n      margin: 0;\n      background: linear-gradient(to bottom, #f4f4f4, #f6f6f6);\n      text-transform: capitalize;\n      line-height: 1.2;\n      font-weight: bold;\n    "]);return D=function(){return e},e}function Y(){var e=Object(u.a)(["\n      margin-top: 0;\n      display: -webkit-box;\n      display: -webkit-flex;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-align-items: center;\n      -webkit-box-align: center;\n      -ms-flex-align: center;\n      align-items: center;\n      margin: 13px 0;\n    "]);return Y=function(){return e},e}var T=function(){var e=Object(a.useState)(!0),n=Object(F.a)(e,2),t=n[0],c=n[1],o=Object(a.useState)([]),l=Object(F.a)(o,2),u=l[0],m=l[1];Object(a.useEffect)((function(){c(!0),N.a.get(d.DEPLOYMENT_HOST+"api/get_blog_list").then((function(e){e.data.forEach((function(e){e.date=new Date(e.date)})),m(e.data)})).then((function(){c(!1)})).catch((function(e){I.a.error("Error ",e)}))}),[]);var p=d.CURRENTYEAR;return r.a.createElement(r.a.Fragment,null,t?r.a.createElement(r.a.Fragment,null):u.map((function(e,n){return function(e,n){var t=f.a.div(Y()),a=f.a.div(D()),c=Object(f.a)(i.b)(A()),o=f.a.div(M()),l=!1;return 0!==n&&e.date.getFullYear()===p||(l=!0,p=e.date.getFullYear()),r.a.createElement(r.a.Fragment,{key:"blog_list_fragment_".concat(n)},l&&r.a.createElement("h1",{key:"yeartag_".concat(n)},e.date.getFullYear()),r.a.createElement(t,{key:"postblock_".concat(n)},r.a.createElement(o,{key:"date_".concat(n)},b(e.date,"main")),r.a.createElement(a,{key:"posttext_".concat(n)},r.a.createElement(c,{key:"post_".concat(n),to:"post/"+e.abbrlink},e.title))))}(e,n)})))};function R(){var e=Object(u.a)(["\n  padding: 50px;\n\n  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {\n    padding: 50px 15px;\n  }\n"]);return R=function(){return e},e}function z(){var e=Object(u.a)(["\n  background: white;\n  box-shadow: 0 1px 6px #e5e5e5;\n"]);return z=function(){return e},e}function L(){var e=Object(u.a)(["\n  width: 75%;\n  margin: 7% auto;\n\n  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {\n    width: 100%;\n  }\n"]);return L=function(){return e},e}function U(){var e=Object(u.a)(["\n  font-size: 18px;\n"]);return U=function(){return e},e}function B(){var e=Object(u.a)(["\n  color: inherit;\n  text-decoration: none;\n  font-size: 25px;\n  font-weight: bold;\n  line-height: 1.25;\n  padding-right: 25px;\n\n  &:hover {\n    text-decoration: none;\n    color: inherit;\n  }\n"]);return B=function(){return e},e}function P(){var e=Object(u.a)(["\n  display: block;\n  margin-bottom: 20px;\n  margin-left: 20px;\n"]);return P=function(){return e},e}var K=f.a.div(P()),G=Object(f.a)(i.b)(B()),W=Object(f.a)(G)(U()),J=f.a.div(L()),Z=f.a.div(z()),Q=f.a.div(R()),q=function(e){var n=e.children;return document.body.style="background: #fafafa;",r.a.createElement(J,null,r.a.createElement(K,null,r.a.createElement(G,{to:""},"Home"),r.a.createElement(W,{to:"/salt"},"Note"),r.a.createElement(W,{to:"/blog"},"Blog"),r.a.createElement(W,{to:"/about"},"About")),r.a.createElement(Z,null,r.a.createElement(Q,null,n)))},V=function(){return r.a.createElement(q,null,r.a.createElement(T,null))},X=t(232),$=Object(X.a)();function ee(){var e=Object(u.a)(['\n  position: absolute;\n  top: 30%;\n  margin-left: 5%;\n  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial,\n    sans-serif;\n  font-weight: bold;\n  font-size: 3rem;\n  line-height: 1.25;\n  letter-spacing: 0.1rem;\n  color: black;\n  margin-bottom: 15px;\n']);return ee=function(){return e},e}var ne=f.a.p(ee()),te=function(){return r.a.createElement(ne,null,"404")},ae=t(233),re=t.n(ae),ce=t(729),oe=t(724);function ie(){var e=Object(u.a)(["\n  font-size: 16px;\n  /* font-family: Monaco, monospace; */\n  line-height: 100%;\n  padding: 0.2em;\n  word-break: normal;\n  background-color: #f7f4eb !important;\n"]);return ie=function(){return e},e}var le=Object(f.a)(ce.a)(ie()),ue=function(e){return r.a.createElement(le,{language:e.language,style:oe.a,showLineNumbers:!1,wrapLines:!0},e.value)};function fe(){var e=Object(u.a)(['\n  font-size: 0.85em;\n  font-family: Consolas, "Bitstream Vera Sans Mono", "Courier New", Courier,\n    monospace;\n  line-height: 1.2em;\n  word-break: normal;\n  background: #f2efe6;\n  padding: 0.2em 0.3em;\n  border-radius: 5px;\n  color: #f55151;\n']);return fe=function(){return e},e}var me=f.a.span(fe()),de=function(e){return r.a.createElement(me,null,e.value)};function be(){var e=Object(u.a)(["\n  padding: 20px 5px 10px 30px;\n  background: #eee;\n  margin-bottom: 10px;\n\n  p {\n    line-height: 25px;\n  }\n"]);return be=function(){return e},e}var pe=f.a.div(be()),se=function(e){return r.a.createElement(pe,null,e.children)};function ge(){var e=Object(u.a)(["\n  max-width: 100%;\n  opacity: 0.2;\n"]);return ge=function(){return e},e}var Ee=f.a.img(ge()),he=function(e){return r.a.createElement(Ee,e)},ve=t(725);function xe(){var e=Object(u.a)(["\n  text-decoration: underline;\n  color: #ebcd09;\n\n  &:hover,\n  &:visited,\n  &:focus {\n    text-decoration: underline;\n  }\n"]);return xe=function(){return e},e}function Oe(){var e=Object(u.a)([""]);return Oe=function(){return e},e}var we=f.a.div(Oe()),ke=f.a.a(xe()),je=function(){return r.a.createElement(we,null,"If you like what I'm doing you can"," ",r.a.createElement(ke,{href:d.BUYMECOFFEE,target:"_blank"},"buy me a coffee")," ","\u2615\ufe0f")};function ye(){var e=Object(u.a)([""]);return ye=function(){return e},e}var _e=f.a.div(ye()),Ce=function(){return r.a.createElement(_e,null,"Copyright \xa9 ",d.CURRENTYEAR)};function Se(){var e=Object(u.a)([""]);return Se=function(){return e},e}var Fe=f.a.div(Se()),He=function(){return r.a.createElement(Fe,null,"Author: ",d.WHOAMI)};function Ne(){var e=Object(u.a)(["\n  padding-left: 30px;\n\n  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {\n    padding: 0;\n    text-align: center;\n    font-size: 13px;\n  }\n"]);return Ne=function(){return e},e}function Ie(){var e=Object(u.a)(['\n  -webkit-tap-highlight-color: transparent;\n  font-family: "Liu Jian Mao Cao", cursive;\n  font-size: 18px;\n  line-height: 1.7;\n\n  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {\n    font-size: 16px;\n  }\n']);return Ie=function(){return e},e}function Me(){var e=Object(u.a)(["\n  padding: 30px;\n"]);return Me=function(){return e},e}var Ae=Object(f.a)(ve.a)(Me()),De=f.a.div(Ie()),Ye=f.a.div(Ne()),Te=function(){return r.a.createElement(r.a.Fragment,null,r.a.createElement(Ae,{plain:!0},r.a.createElement(De,null,"\u5b8c")),r.a.createElement(Ye,null,r.a.createElement(He,null),r.a.createElement(Ce,null),r.a.createElement(je,null)))};function Re(){var e=Object(u.a)(['\n  -webkit-tap-highlight-color: transparent;\n  font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial,\n    "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;\n  /* font-family: "Source Serif Pro", "Source Han Serif SC", "Noto Serif CJK SC",\n  "Noto Serif SC", serif; */\n  /* color: rgba(0, 0, 0, 0.8); */\n  font-size: 18px;\n  line-height: 1.7;\n\n  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {\n    font-size: 16px;\n  }\n']);return Re=function(){return e},e}function ze(){var e=Object(u.a)(["\n  text-align: center;\n  margin: 6px auto 20px;\n"]);return ze=function(){return e},e}function Le(){var e=Object(u.a)(["\n  line-height: 1.25;\n  font-size: 26px;\n  font-weight: bold;\n  text-align: center;\n  display: block;\n"]);return Le=function(){return e},e}function Ue(){var e=Object(u.a)(['\n  font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial,\n    "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;\n']);return Ue=function(){return e},e}var Be=f.a.div(Ue()),Pe=f.a.div(Le()),Ke=f.a.div(ze()),Ge=f.a.div(Re()),We=Object(l.g)((function(e){var n=e.match.params.id,t=Object(a.useState)(!0),c=Object(F.a)(t,2),o=c[0],i=c[1],l=Object(a.useState)({}),u=Object(F.a)(l,2),f=u[0],m=u[1];return Object(a.useEffect)((function(){i(!0),N.a.post(d.DEPLOYMENT_HOST+"api/get_post",{id:n}).then((function(e){e.data.date=new Date(e.data.date),m(e.data)})).catch((function(e){I.a.error("Error ",e)})).then((function(){i(!1)}))}),[n]),r.a.createElement(q,null,o?r.a.createElement(r.a.Fragment,null):r.a.createElement(Be,null,r.a.createElement(Pe,null,f.title),r.a.createElement(Ke,null,b(f.date,"post")),r.a.createElement(Ge,null,r.a.createElement(re.a,{source:f.body,escapeHtml:!1,renderers:{code:ue,inlineCode:de,blockquote:se,image:he}})),r.a.createElement(Te,null)))})),Je=t(174),Ze=t(730),Qe=t(726);function qe(){var e=Object(u.a)(["\n  font-size: 20px;\n  font-weight: bold;\n  text-align: center;\n  padding-bottom: 20px;\n"]);return qe=function(){return e},e}function Ve(){var e=Object(u.a)([""]);return Ve=function(){return e},e}var Xe=Object(f.a)(Ze.a)(Ve()),$e=f.a.div(qe()),en=function(){var e=Object(a.useState)(!0),n=Object(F.a)(e,2),t=n[0],c=n[1],o=Object(a.useState)([]),l=Object(F.a)(o,2),u=l[0],f=l[1],m=Object(a.useState)(0),b=Object(F.a)(m,2),p=b[0],g=b[1];Object(a.useEffect)((function(){c(!0),N.a.get(d.DEPLOYMENT_HOST+"api/get_salt_list").then((function(e){f(e.data.map((function(e,n){return Object(Je.a)(Object(Je.a)({},e),{},{key:n})})))}))}),[]),Object(a.useEffect)((function(){N.a.get(d.DEPLOYMENT_HOST+"api/get_total_note_num").then((function(e){g(e.data)})).catch((function(e){I.a.error("Error ",e)})).then((function(){c(!1)}))}),[]);var E=[{title:"\u4e66\u540d",dataIndex:"title",key:"title",width:"25%",render:function(e){return r.a.createElement(i.b,{to:"salt/"+e},e)},onCell:function(e,n){return{key:"title_".concat(n)}}},{title:"\u4f5c\u8005",dataIndex:"author",key:"author",width:"20%",onCell:function(e,n){return{key:"author_".concat(n)}}},{title:"\u7b14\u8bb0\u6570\u91cf",dataIndex:"notenum",key:"notenum",width:"12%",align:"center",sorter:function(e,n){return e.notenum-n.notenum},onCell:function(e,n){return{key:"notenum_".concat(n)}}},{title:"\u8c46\u74e3\u8bc4\u5206",dataIndex:"rating",key:"rating",width:"12%",align:"center",sorter:function(e,n){return e.rating-n.rating},onCell:function(e,n){return{key:"rating_".concat(n)}}},{title:"\u6807\u7b7e",dataIndex:"tag",key:"tag",render:function(e,n){return e.map((function(e,t){return function(e,n,t){return r.a.createElement(r.a.Fragment,null,n<=3&&r.a.createElement(Xe,{key:"tag_block_".concat(t.key,"_").concat(n)},e))}(e,t,n)}))},onCell:function(e,n){return{key:"tag_".concat(n)}}}];return s.isMobile&&E.pop(),r.a.createElement(r.a.Fragment,null,t?r.a.createElement(r.a.Fragment,null):r.a.createElement(r.a.Fragment,null,r.a.createElement($e,null,"".concat(p," \u4e2a\u7b14\u8bb0")),r.a.createElement(Qe.a,{pagination:!1,columns:E,dataSource:u})))},nn=function(){return r.a.createElement(q,null,r.a.createElement(en,null))},tn=t(727),an=t(254),rn=t.n(an);function cn(){var e=Object(u.a)(["\n  margin: 0;\n  padding: 10px;\n  font-size: 16px;\n"]);return cn=function(){return e},e}function on(){var e=Object(u.a)(["\n  margin-bottom: 15px;\n  background: #f7f7f7;\n"]);return on=function(){return e},e}function ln(){var e=Object(u.a)(["\n  font-weight: bold;\n  font-size: 22px;\n  margin-bottom: 15px;\n  margin-top: 20px;\n"]);return ln=function(){return e},e}function un(){var e=Object(u.a)(["\n  text-align: center;\n  font-size: 15px;\n"]);return un=function(){return e},e}function fn(){var e=Object(u.a)(["\n  text-align: center;\n  font-weight: bold;\n  font-size: 40px;\n"]);return fn=function(){return e},e}function mn(){var e=Object(u.a)(['\n  font-family: "Noto Serif SC", "Noto Serif", "Source Han Serif SC",\n    "Source Han Serif", serif;\n']);return mn=function(){return e},e}var dn=f.a.div(mn()),bn=f.a.div(fn()),pn=f.a.div(un()),sn=f.a.div(ln()),gn=Object(f.a)(tn.a)(on()),En=f.a.p(cn()),hn=Object(l.g)((function(e){var n=e.match.params.key,t=Object(a.useState)(!0),c=Object(F.a)(t,2),o=c[0],i=c[1],l=Object(a.useState)({}),u=Object(F.a)(l,2),f=u[0],m=u[1];Object(a.useEffect)((function(){i(!0),N.a.post(d.DEPLOYMENT_HOST+"api/get_book_note",{key:n}).then((function(e){m(e.data)})).catch((function(e){I.a.error("Error ",e)})).then((function(){i(!1)}))}),[n]);var b=function(e,n,t){return 0===n?r.a.createElement(sn,{key:"chapter_title_".concat(t,"_").concat(n)},e):r.a.createElement(gn,{hoverable:!0,bodyStyle:{padding:"0",color:"rgba(0, 0, 0, 0.85)"},onClick:function(){return n=e,rn()(n),void I.a.success("Copied to clipboard!");var n},key:"note_wrapper_".concat(t,"_").concat(n)},r.a.createElement(En,{key:"note_".concat(t,"_").concat(n)},e))};return r.a.createElement(q,null,o?r.a.createElement(r.a.Fragment,null):r.a.createElement(dn,null,r.a.createElement(bn,null,f.title),r.a.createElement(pn,null,f.author),f.note.map((function(e,n){return function(e,n){return r.a.createElement(r.a.Fragment,{key:"salt_content_fragment_".concat(n)},e.map((function(e,t){return b(e,t,n)})))}(e,n)}))))})),vn=function(){return window.open("".concat("","/rss.xml"),"_self"),r.a.createElement(r.a.Fragment,null)},xn=function(){return window.open("".concat("","/Kefan_Dong_Resume_PDF.pdf"),"_self"),r.a.createElement(r.a.Fragment,null)},On=t(731),wn=t(732),kn=t(733),jn=t(734),yn=t(735),_n=t(736),Cn=t(737);function Sn(){var e=Object(u.a)([""]);return Sn=function(){return e},e}function Fn(){var e=Object(u.a)(["\n  padding: 0 0 10px 20px;\n"]);return Fn=function(){return e},e}function Hn(){var e=Object(u.a)(["\n  padding: 20px;\n  font-size: 20px;\n  font-weight: bold;\n"]);return Hn=function(){return e},e}var Nn=f.a.div(Hn()),In=f.a.div(Fn()),Mn=Object(f.a)("a").attrs((function(e){return{target:"_blank",rel:"noopener noreferrer"}}))(Sn()),An=function(){return r.a.createElement(r.a.Fragment,null,r.a.createElement("div",null,r.a.createElement(wn.a,null)," | ",r.a.createElement(Mn,{href:d.MAIL},"me@kefan.me")),r.a.createElement("div",null,r.a.createElement(kn.a,null)," | ",r.a.createElement(Mn,{href:d.GITHUB},"k27dong")),r.a.createElement("div",null,r.a.createElement(jn.a,null)," |"," ",r.a.createElement(Mn,{href:d.LINKEDIN},"Kefan Dong")),r.a.createElement("div",null,r.a.createElement(yn.a,null)," | ",r.a.createElement(Mn,{href:d.RESUME},"Resume")),r.a.createElement("div",null,r.a.createElement(_n.a,null)," | ",r.a.createElement(Mn,{href:d.ZHIHU},"\u771f\u670b\u514b\u559d\u53ef\u4e50")),r.a.createElement("div",null,r.a.createElement(Cn.a,null)," | ",r.a.createElement(Mn,{href:d.BUYMECOFFEE},"Support")))},Dn=function(){return r.a.createElement(r.a.Fragment,null,r.a.createElement(In,null,"\u6211\u662f\u4e00\u540d\u6ed1\u94c1\u5362\u5927\u5b66\u7684\u5927\u4e09\u5b66\u751f\uff0c\u5b66\u4e60\b",r.a.createElement(Mn,{href:"https://uwaterloo.ca/future-students/programs/computer-engineering"},"\u8ba1\u7b97\u673a\u5de5\u7a0b\u3002")),r.a.createElement(In,null,"\u6211\u4eca\u5e74",p(),"\u5c81\uff0c\u4f4f\u5728\u591a\u4f26\u591a\u3002"),r.a.createElement(Nn,null,"\u8054\u7cfb\u65b9\u5f0f"),r.a.createElement(An,null))},Yn=function(){return r.a.createElement(r.a.Fragment,null,r.a.createElement(In,null,"I'm a 3rd year"," ",r.a.createElement(Mn,{href:"https://uwaterloo.ca/future-students/programs/computer-engineering"},"Computer Engineer"," "),"student at the University of Waterloo."),r.a.createElement(In,null,"I'm ",p()," years old, currently living in Toronto, Canada."),r.a.createElement(Nn,null,"Contact Me"),r.a.createElement(An,null))};function Tn(){var e=Object(u.a)(["\n  position: absolute;\n"]);return Tn=function(){return e},e}var Rn=Object(f.a)(On.a)(Tn()),zn={name:{cn:"\u8463\u73c2\u74a0",en:"Kefan Dong"},birthday:"2000/04/03",intro:{cn:r.a.createElement(Dn,null),en:r.a.createElement(Yn,null)}},Ln=function(){var e=Object(a.useState)("en"),n=Object(F.a)(e,2),t=n[0],c=n[1];return r.a.createElement(q,null,r.a.createElement(Be,null,r.a.createElement(Rn,{onChange:function(e){c(e?"en":"cn")},checkedChildren:"EN",unCheckedChildren:"ZH",defaultChecked:!0}),r.a.createElement(Pe,null,zn.name[t]),r.a.createElement(Ke,null,zn.birthday),r.a.createElement(Ge,null,zn.intro[t])))},Un=Object(l.g)((function(e){var n=e.history,t=e.children;return Object(a.useEffect)((function(){var e=n.listen((function(){window.scrollTo(0,0)}));return function(){e()}}),[]),r.a.createElement(a.Fragment,null,t)})),Bn=function(){return r.a.createElement(i.a,{history:$},r.a.createElement(Un,null,r.a.createElement(l.d,null,r.a.createElement(l.b,{path:"/",exact:!0},r.a.createElement(S,null)),r.a.createElement(l.b,{path:"/blog",exact:!0},r.a.createElement(V,null)),r.a.createElement(l.b,{path:"/post/:id",exact:!0},r.a.createElement(We,null)),r.a.createElement(l.b,{path:"/salt",exact:!0},r.a.createElement(nn,null)),r.a.createElement(l.b,{path:"/salt/:key",exact:!0},r.a.createElement(hn,null)),r.a.createElement(l.b,{path:"/feed",exact:!0},r.a.createElement(vn,null)),r.a.createElement(l.b,{path:"/resume",exact:!0},r.a.createElement(xn,null)),r.a.createElement(l.b,{path:"/about",exact:!0},r.a.createElement(Ln,null)),r.a.createElement(l.b,{path:"/404"},r.a.createElement(te,null)),r.a.createElement(l.a,{to:"/404"}))))};o.a.render(r.a.createElement(Bn,null),document.getElementById("root"))}},[[262,1,2]]]);
//# sourceMappingURL=main.d678c82c.chunk.js.map