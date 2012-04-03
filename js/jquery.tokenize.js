/**
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * This software consists of voluntary contributions made by many individuals
 * and is licensed under the new BSD license.
 *
 * @author      David Zeller <zellerda01@gmail.com>
 * @license     http://www.opensource.org/licenses/BSD-3-Clause New BSD license
 */
(function($, tokenize){

    $.tokenize = function(opts){

        if(opts == undefined)
        {
            opts = $.fn.tokenize.defaults;
        }

        this.options = opts;
    };

    $.extend($.tokenize.prototype, {

        init: function(element){

            this.el = element;

            this.el.attr('multiple', 'multiple');
            this.el.hide();

            this.createHtml();

        },

        createHtml: function(){

            var $this = this;
            this.mouseOnContainer = false;

            // Container div
            this.container = $('<div />');
            this.container.addClass('Tokenize');
            this.container.width(this.el.width());

            // Dropdown
            this.dropdown = $('<ul />');
            this.dropdown.addClass('Dropdown');

            // List container
            this.tokens = $('<ul />');
            this.tokens.width(this.el.width());
            this.tokens.addClass('Tokens');

            // List item search
            this.searchItem = $('<li class="SearchField" />');

            // Search input
            this.searchInput = $('<input />');
            this.searchInput.attr('maxlength', this.options.maxChars);

            // Add to HTML
            this.searchItem.append(this.searchInput);
            this.tokens.append(this.searchItem);
            this.container.append(this.tokens);
            this.container.append(this.dropdown);
            this.container.insertAfter(this.el);

            this.updateInput();
            this.fillDefaults();

            // Configure dropdown
            this.dropdown.width(this.tokens.width());
            this.dropdown.css('top', this.tokens.outerHeight() - this.tokens.pixels('border-top-width'));

            if(this.options.datas == 'select')
            {
                this.searchInput.bind('focus', function(){
                    $this.cleanPendingDelete();
                    $this.fillDropdown();
                    $this.showDropdown();
                });
            }

            this.tokens.bind('click', function(){
                $this.searchInput.get(0).focus();
            });

            this.searchInput.bind('blur', function(){
                if(!$this.mouseOnContainer){
                    $this.closeDropdown();
                }
            });

            this.searchInput.bind('keydown', function(e){
                $this.updateInput();
                $this.keydown(e);
            });

            this.searchInput.bind('keyup', function(e){
                $this.keyup(e);
            });

            this.container.bind('mouseenter', function(){
                $this.mouseOnContainer = true;
            });

            this.container.bind('mouseleave', function(){
                $this.mouseOnContainer = false;
            });

        },

        fillDefaults: function(){

            var $this = this;

            $('option:selected', this.el).each(function(){
                $this.addToken($(this));
            });

        },

        showDropdown: function(){

            this.dropdown.show();
            this.updateDropdown();

        },

        fillDropdown: function(){

            this.cleanDropdown();
            var $this = this;

            $('option', this.el).not(':selected').each(function(){
                $this.addDropdownItem($(this).val(), $(this).html());
            });

        },

        cleanDropdown: function(){

            this.dropdown.html('');

        },

        updateDropdown: function(){

            var item_count = 0, item_height;

            $('li', this.dropdown).each(function(){
                item_count++;
            });

            if(item_count > 0){
                item_height = $('li:first-child', this.dropdown).outerHeight();

                if(item_count >= this.options.size){
                    this.dropdown.height(item_height * this.options.size);
                }
            } else {
                this.closeDropdown();
            }

        },

        closeDropdown: function(clean){

            if(clean == undefined){
                clean = true;
            }

            this.dropdown.hide();

            if(clean){
                this.cleanDropdown();
            }

        },

        addDropdownItem: function(key, label){

            if($('li[data="' + key + '"]', this.tokens).length)
            {
                return false;
            }

            var item = $('<li />'), $this = this;

            item.attr('data', key);
            item.html(label);

            item.bind('click', function(){
                $this.addToken($(this));
            }).bind('mouseover', function(){
                $(this).addClass('Highlight');
            }).bind('mouseout', function(){
                $('li', $this.dropdown).removeClass('Highlight');
            });

            this.dropdown.append(item);

        },

        cleanInput: function(){

            this.searchInput.val('');
            this.updateInput();

        },

        cleanPendingDelete: function(){

            $('li.PendingDelete', this.tokens).removeClass('PendingDelete');

        },

        addToken: function(el){

            var token = $('<li />'),
                close = $('<a />'),
                is_new = false,
                $this = this;

            if($('option[value="' + el.attr('data') + '"]', this.el).length){
                $('option[value="' + el.attr('data') + '"]', this.el).attr('selected', 'selected');
            } else if(!el.is('option')) {
                var option = $('<option />');
                option.attr('selected', 'selected');
                option.attr('value', el.attr('data'));
                option.attr('data', 'custom');
                option.html(el.html());

                this.el.append(option);
                is_new = true;
            }

            close.html('×');
            close.addClass('Close');
            close.bind('click', function(){
                $this.removeToken(token);
            });

            token.addClass('Token');

            if(el.is('option')){
                token.attr('data', el.attr('value'));
            } else {
                token.attr('data', el.attr('data'));
            }

            token.append('<span>' + el.html() + '</span>');
            token.prepend(close);
            token.insertBefore(this.searchItem);

            if(is_new){
                this.options.onTokenNew(el);
            } else {
                this.options.onTokenAdd(el);
            }

            this.cleanInput();
            this.closeDropdown();

        },

        removeToken: function(token){

            var option = $('option[value="' + token.attr('data') + '"]', this.el);

            if(option.attr('data') == 'custom'){
                option.remove();
            } else {
                option.removeAttr('selected');
            }

            token.remove();
            this.options.onTokenRemove(token);

            this.updateInput();
            this.closeDropdown();

        },

        updateInput: function(){

            if($('li.Token', this.tokens).length > 0){

                this.searchFieldScale();

            } else {
                // Change input width
                this.searchInput.width(
                    this.tokens.width() -
                    this.searchInput.pixels('padding-left') -
                    this.searchInput.pixels('padding-right')
                );
            }

        },

        searchFieldScale: function(){

            var measure = $('<div />'), margins;

            measure.css({ position: 'absolute', visibility: 'hidden' });
            measure.addClass('TokenizeMeasure');
            measure.html(this.searchInput.val());

            $('body').append(measure);

            margins = this.searchInput.pixels('padding-left') + this.searchInput.pixels('padding-right');
            this.searchInput.width(measure.width() + 25 - margins);

            measure.remove();

        },

        keydown: function(e){

            if(e.keyCode == this.options.validator)
            {
                e.preventDefault();
                this.addCustomToken();
            }
            else
            {
                switch(e.keyCode)
                {
                    // Delete
                    case 8:
                        if(this.searchInput.val().length == 0){
                            e.preventDefault();
                            if($('li.Token.PendingDelete', this.tokens).length){
                                this.removeToken($('li.Token.PendingDelete'));
                            } else {
                                $('li.Token:last', this.tokens).addClass('PendingDelete');
                            }
                        } else if(this.searchInput.val().length == 1) {
                            this.closeDropdown();
                        }
                        break;

                    // Return
                    case 9:
                    case 13:
                        e.preventDefault();
                        if($('li.Highlight', this.dropdown).length){
                            this.addToken($('li.Highlight', this.dropdown));
                        } else {
                            this.addCustomToken();
                        }
                        this.cleanPendingDelete();
                        break;

                    // ESC
                    case 27:
                        this.cleanInput();
                        this.closeDropdown();
                        this.cleanPendingDelete();
                        break;

                    // Go up
                    case 38:
                        e.preventDefault();
                        this.goUp();
                        break;

                    // Go down
                    case 40:
                        e.preventDefault();
                        this.goDown();
                        break;

                    default:
                        this.cleanPendingDelete();
                        break;
                }
            }

        },

        keyup: function(e){

            switch(e.keyCode)
            {
                case 9:
                case 13:
                case 27:
                case 38:
                case 40:
                    break;
                default:
                    this.search();
                    break;
            }

        },

        addCustomToken: function(){

            if(this.options.newElements && this.searchInput.val())
            {
                if($('li[data="' + this.searchInput.val() + '"]', this.tokens).length)
                {
                    this.cleanInput();
                    return false;
                }

                var li = $('<li />');
                li.attr('data', this.searchInput.val());
                li.html(this.searchInput.val());
                this.addToken(li);
            }
            else
            {
                this.cleanInput();
            }

        },

        goUp: function(){

            if($('li.Highlight', this.dropdown).length > 0){
                if(!$('li.Highlight').is('li:first-child'))
                {
                    $('li.Highlight').removeClass('Highlight').prev().addClass('Highlight');
                }
            } else {
                $('li:first', this.dropdown).addClass('Highlight');
            }
        },

        goDown: function(){

            if($('li.Highlight', this.dropdown).length > 0){
                if(!$('li.Highlight').is('li:last-child'))
                {
                    $('li.Highlight').removeClass('Highlight').next().addClass('Highlight');
                }
            } else {
                $('li:first', this.dropdown).addClass('Highlight');
            }
        },

        search: function(){

            var $this = this;

            if(this.options.datas == 'select'){
                var found = false,
                    regexp = new RegExp($this.searchInput.val().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');

                this.cleanDropdown();

                $('option', this.el).not(':selected').each(function(){
                    if(regexp.test($(this).html())){
                        $this.addDropdownItem($(this).attr('value'), $(this).html());
                        found = true;
                    }
                });

                if(found){
                    this.showDropdown();
                    $('li:first', this.dropdown).addClass('Highlight');
                    this.updateDropdown();
                } else {
                    this.closeDropdown();
                }
            }
            else
            {
                $.getJSON(this.options.datas, this.options.searchParam + "=" + this.searchInput.val(), function(data){
                    if(data){
                        $this.cleanDropdown();

                        $.each(data, function(key, val){
                            $this.addDropdownItem(key, val);
                        });

                        $this.showDropdown();
                        $('li:first', $this.dropdown).addClass('Highlight');
                        $this.updateDropdown();
                    } else {
                        $this.closeDropdown();
                    }
                });
            }
        }

    });

    $.fn.tokenize = function(options){

        if(options == undefined)
        {
            options = {};
        }

        var opt = $.extend({}, $.fn.tokenize.defaults, options);
        var obj = new $.tokenize(opt);
        obj.init(this);

        $(this).data('tokenize', obj);

        return this;

    };

    $.fn.tokenize.defaults = {

        datas: 'select',
        searchParam: 'search',
        validator: 188,
        newElements: true,
        size: 10,
        maxChars: 50,

        onTokenAdd: function(token){},
        onTokenNew: function(token){},
        onTokenRemove: function(token){}

    };

    $.fn.pixels = function(property) {

        return parseInt(this.css(property).slice(0,-2));

    };

})(jQuery, 'tokenize');