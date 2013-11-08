/*
******************************************************
* File:Chifoumi.js
* Date:7/11/2013
* Version: 1.0
* Author: Alban Vidal-Naquet (alban@albanvn.net)
* Sarah plugin for Chifoumi game
******************************************************
*/
var loc=require('./customloc.js');

/*******************
  TODO:
  Chifoumi multijoueurs
*/

//       pierre, ciseau, puit, feuille = 1
//pierre   0       -1     1       1   
//ciseau   1        0     1      -1   
//puit    -1       -1     0       1   
//feuille -1        1    -1       0    
// = -1
const gs_res1=[ 0, -1, 1, 1 ];
const gs_res2=[ 1, 0, 1, -1 ];
const gs_res3=[ -1, -1, 0, 1 ];
const gs_res4=[ -1, 1, -1, 0 ];
// Battle result matrix
const gs_res=new Array(gs_res1, gs_res2, gs_res3, gs_res4);
// Forget about current game after 10 minutes and restart (in mseconds)
const gs_timeout=10*60*1000;

var g_sign=new Array();
var g_s1=0;
var g_s2=0;
var g_date=0;
var g_choice=0;

exports.init = function(SARAH)
{
	loc.initLocalisation();
	loc.addDictEntry("S1", function(){return g_s1;},function(val){g_s1=val;});
	loc.addDictEntry("S2", function(){return g_s2;},function(val){g_s2=val;});
	loc.addDictEntry("CHOICE", function(){return g_choice;},function(val){g_choice=val;});
	g_sign=loc.getLocalString("SIGNS").split(',');
	g_choice=chooseSign();
}

exports.action = function(data, callback, config, SARAH)
{
  var txt="";
  
  config=config.modules.Chifoumi;
  if (g_date==0)
    g_date=new Date().getTime();
  else
    if (g_date>new Date().getTime()+gs_timeout)
	{
	  g_s1=0;
	  g_s2=0;
	}
  switch(data.choice)
  {
    case "start":
	  txt=loc.getLocalString("LETSPLAY");
	  g_s1=0;
	  g_s2=0;
	  g_date=new Date().getTime();
	  break;
    case "score":
	  txt=getScore(1);
	  break;
	default:
	  var res=doBattle(data.choice,g_choice);
	  if (res==0) {txt=loc.getLocalString("RESULT1");}
	  if (res==-1) {g_s1++;txt=loc.getLocalString("RESULT2");}
	  if (res==1) {g_s2++;txt=loc.getLocalString("RESULT3");}
	  if (g_s1>=config.win_score || g_s2>=config.win_score)
	  {
	    if (g_s1>=config.win_score)
		  txt+=loc.getLocalString("YOUWINFINAL");
		else
		  txt+=loc.getLocalString("IWINFINAL");
		g_s1=0;
		g_s2=0;
		g_date=0;
	  }
	  else 
	    txt+=getScore(0);
	  break;
  }
  //console.log(txt);
  SARAH.speak(txt);
  // Choose next sign for next step
  g_choice=chooseSign();  
  callback();
}

var getScore=function(type)
{
	var txt="";
	if (type==1)
	{
		txt=loc.getLocalString("SCOREIS");
		if (g_s1<g_s2) txt+=loc.getLocalString("IWIN");
		if (g_s1>g_s2) txt+=loc.getLocalString("YOUWIN");
		if (g_s1==g_s2) txt+=loc.getLocalString("EQUAL");
	}
	else
	{
	    if (g_s1==g_s2)
		  txt=loc.getLocalString("EQUAL2");
		else
		{
		  if (g_s1>g_s2) txt=loc.getLocalString("SCOREIS2");
		  else txt=loc.getLocalString("SCOREIS3");
		}
	}
	return txt;
}

var getValue=function(choice)
{
  for (t=0;t<g_sign.length;t++)
    if (g_sign[t]==choice)
	  return t;
  return -1;
}

var doBattle=function(ch1,ch2)
{
  var v1=getValue(ch1);
  var v2=getValue(ch2);
  //console.log(ch1+" "+v1+"(-1) contre "+ch2+" "+v2+"(1) :"+gs_res[v1][v2]);
  return gs_res[v1][v2];
}

var chooseSign=function()
{
  return g_sign[Math.floor((Math.random()*100)%g_sign.length)];
}

