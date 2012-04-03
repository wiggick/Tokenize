This jQuery plugin transform a select into a tokens input autocomplete.

![](http://doc.zellerda.com/tokenize/screenshot.png)

First you have to include the source scripts and css in the head of your html page :

```html
<script type="text/javascript" src="js/jquery.js"></script>
<script type="text/javascript" src="js/jquery.tokenize.js"></script>
<link rel="stylesheet" type="text/css" href="css/jquery.tokenize.css" />
```

And next you can use the plugin like this :

```html
<select class="Tokenize" size="20" style="width: 450px;">
    <option value="ajax">Ajax</option>
    <option value="javascript">Javascript</option>
    <option value="php">PHP</option>
    <option value="delphi">Delphi</option>
    <option value="java">Java</option>
    <option value="bash">Bash</option>
    <option value="batch">Batch</option>
    <option value="pascal">Pascal</option>
    <option value="css">Cascading stylesheets</option>
</select>

<script type="text/javascript">
    $('select.Tokenize').tokenize();
</script>
```

### Options :

**datas:**
select or an url for ajax search (must return json).
_Default is "select"_

**searchParam**
Parameter name for the ajax search.
_Default is "search"_

**validator**
This parameter is a keyCode to validate a token while typing.
_Default is 188 (",")_

**newElements**
Authorize new token.
_Default is true_

**size**
The size of the dropdown.
_Default is 10_

**maxChars**
The search input max length.
_Default is 50_