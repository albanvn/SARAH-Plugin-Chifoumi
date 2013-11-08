/*
  Localisation and dictionnary lib
  Author:AVN 
*/
const gs_separator="#";

var g_mapDictLocal=new Array();
var g_mapDictGlobal=new Array();
var g_strLocal=new Array();
var g_listLocFile=new Array();
var g_language="fr";

/* Intilialize localisation
   -Load the localisation file (in current dir, the file "localisation_{language}.loc"
   -Initialize the local dictionnary
   -Load the last dictionnary
   -Load the user prefs for localisation string
*/
var initLocalisation=function()
{
	var fs = require('fs');
	var file=__dirname+"\\localisation_"+g_language+".loc";
	var pos=__dirname.lastIndexOf("\\");
	if (pos==-1) pos=__dirname.lastIndexOf("/");
	var modulename=__dirname.substr(pos+1, 99).toUpperCase();
	g_listLocFile[modulename]=file;
	g_mapDictLocal=new Array();
	fs.readFileSync(file).toString().split("\n").forEach(function(line)
	{
	  if (line!="")
	  {
		var v=line.split(gs_separator);
		if (v[1].indexOf("\r")!=-1)
			g_strLocal[v[0]]=v[1].substr(0,v[1].length-1);
		else
			g_strLocal[v[0]]=v[1];
	  }
	});
	loadDict(modulename);
	loadPref(modulename);
	return 0;
}

/* Release localisation */
var releaseLocalisation=function()
{
	var pos=__dirname.lastIndexOf("\\");
	if (pos==-1) pos=__dirname.lastIndexOf("/");
	var modulename=__dirname.substr(pos+1, 99).toUpperCase();
	saveDict(modulename);
	savePref(modulename);
	return 0;
}

/* AddLocalString: 
     Add a local string with given ID
*/
var addLocalString=function(ID, string)
{
	g_strLocal[""+ID+""]=string;
	return 0;
}

/* findLocalString
      Find a local string with the given ID
*/
var findLocalString=function(ID)
{
	if (ID in g_strLocal)
		return g_strLocal[ID];
	return "";
}

/* getLocalString
      find the local string with given ID,
	  then parse it and find all variable and replace them by
	  current values
*/
var getLocalString=function(ID)
{
	var txt=findLocalString(ID);
	var txtfinal=txt;
	var re=new RegExp("(%[^%]*%)","g");
	var res=re.exec(txt);
	while (res!=null)
	{  
		txtfinal=txtfinal.replace(res[0], getValue(res[0]));
		res=re.exec(txt);
	}
	return txtfinal;
}

/* getValue
		Return the associate varName value
*/
var getValue=function(varName)
{
	// Search first in local files, then in global
	if (varName in g_mapDictLocal)
		return g_mapDictLocal[varName].get();
	else if (varName in g_mapDictGlobal)
		return g_mapDictGlobal[varName].get();
	return "";
}

/* setValue
		Set the associate varName value
*/
var setValue=function(varName, value)
{
	// Search first in local files, then in global
	if (varName in g_mapDictLocal)
	{
		g_mapDictLocal[varName].set(value);
		return 0;
	}
	else if (varName in g_mapDictGlobal)
	{
		g_mapDictGlobal[varName].set(value);
		return 0;
	}
	return -1;
}

/* loadDict
		Will load the last saved value (used after a launch to retrieve last values)
*/
var loadDict=function(modulename)
{
	return 0;
}

/* saveDict
		Will save the last value
*/
var saveDict=function(modulename)
{
	return 0;
}

/* loadPref
		Will load overloaded localisation setted by user
*/
var loadPref=function(modulename)
{
	return 0;
}

/* savePref
		Will save overloaded localisation setted by user
*/
var savePref=function(modulename)
{
	return 0;
}

/* addDictEntry
      Add a varName with 2 accessors get/set function to local dictionnary
*/
var addDictEntry=function(varName, fctget, fctset)
{
	var key="%"+varName+"%";
	if (typeof fctget==="undefined" || fctget==0)
		fctget=function(){return "";};
	if (typeof fctset==="undefined" || fctset==0)
		fctset=function(value){};
	g_mapDictLocal[key]={ "get": fctget, "set": fctset };
	return 0;
}

/* addDictEntry
      Add a varName with 2 accessors get/set function to global dictionnary
*/
var addDictGlobalEntry=function(varName, fctget, fctset)
{
	var pos=__dirname.lastIndexOf("\\");
	if (pos==-1) pos=__dirname.lastIndexOf("/");
	var modulename=__dirname.substr(pos+1, 99).toUpperCase();
	if (typeof fctget==="undefined" || fctget==0)
		fctget=function(){return "";};
	if (typeof fctset==="undefined" || fctset==0)
		fctset=function(value){};
	g_mapDictGlobal["%"+modulename+gs_separator+varName+"%"]={ "get": fctget, "set":fctset };
	return 0;
}

function debug()
{
	for (var varName in g_mapDictLocal) 
	{
		console.log("var:"+varName+" get:"+g_mapDictLocal[varName].get+" set:"+g_mapDictLocal[varName].set);
	}
	for (var varName in g_mapDictGlobal) 
	{
		console.log("var:"+varName+" get:"+g_mapDictGlobal[varName].get+" set:"+g_mapDictGlobal[varName].set);
	}
	for (var ID in g_strLocal) 
	{
		console.log("ID:"+ID+" localisation:"+g_strLocal[ID]);
	}
}

var test=function()
{
	var var1=10;
	var var2=20;
	var var3=31;
	initLocalisation();
	addLocalString("TEST1","This is a local dict test A1=%A1% and A2=%A2%");
	addLocalString("TEST2","This is a global dict test CHIFOUMI#A3=%CHIFOUMI#A3% and A1=%A1%");
	var1=14;
	addDictEntry("A1", function(){return var1;}, function(val){return var1;});
	addDictEntry("A2", function(){return var2;}, function(val){return var2;});
	addDictGlobalEntry("A3", function(){return var3;}, function(val){return var3;});
	var2--;
	console.log(getLocalString("TEST1"));
	var1++;
	console.log(getLocalString("TEST2"));
	return 0;
}

exports.initLocalisation=initLocalisation;
exports.releaseLocalisation=releaseLocalisation;
exports.addLocalString=addLocalString;
exports.getValue=getValue;
exports.setValue=setValue;
exports.addDictEntry=addDictEntry;
exports.addDictGlobalEntry=addDictGlobalEntry;
exports.findLocalString=findLocalString;
exports.getLocalString=getLocalString;
exports.test=test;

