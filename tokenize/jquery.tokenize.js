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
 * @version     2.0
 */
(function($, tokenize){

    // Keycodes
    var KEYS = {
        BACKSPACE: 8,
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        ARROW_UP: 38,
        ARROW_DOWN: 40,
        COMMA: 188
    };

    // Data storage constant
    var DATA = 'tokenize';

    $.tokenize = function(opts){

        if(opts == undefined){
            opts = $.fn.tokenize.defaults;
        }

        this.options = opts;
    };

    $.extend($.tokenize.prototype, {

        init: function(el){

            var $this = this;
            this.mouseOnContainer = false;
            this.select = el.attr('multiple', 'multiple').css({margin: 0, padding: 0, border: 0}).hide();

            this.container = $('<div />')
                .attr('class', this.select.attr('class'))
                .addClass('Tokenize');

            this.dropdown = $('<ul />')
                .addClass('Dropdown');

            this.tokensContainer = $('<ul />')
                .addClass('TokensContainer');

            this.searchToken = $('<li />')
                .addClass('TokenSearch')
                .appendTo(this.tokensContainer);

            this.searchInput = $('<input />')
                .attr('maxlength', this.options.searchMaxLength)
                .appendTo(this.searchToken);

            this.container
                .append(this.tokensContainer)
                .append(this.dropdown)
                .insertAfter(this.select);

            this.tokensContainer.bind('click', function(){
                $this.searchInput.get(0).focus();
                if($this.dropdown.is(':hidden') && $this.searchInput.val() != ''){
                    $this.search();
                }
            });

            this.searchInput.bind('keydown', function(e){
                $this.resizeSearchInput();
                $this.keydown(e);
            });

            this.searchInput.bind('keyup', function(e){
                $this.keyup(e);
            });

            this.searchInput.on('paste', function(e){
                setTimeout(function(){ $this.resizeSearchInput(); }, 10);
            });

            this.container.bind('mouseenter', function(){
                $this.mouseOnContainer = true;
            });

            this.container.bind('mouseleave', function(){
                $this.mouseOnContainer = false;
            });

            $(document).bind('click', function(){
                if(!$this.mouseOnContainer){
                    $this.dropdownHide();
                }
            });

            this.resizeSearchInput();

            $('option:selected', this.select).each(function(){
                $this.tokenAdd($(this).attr('value'), $(this).html(), true);
            });

        },

        dropdownShow: function(){

            this.dropdown.show();

        },

        dropdownPrev: function(){

            if($('li.Hover', this.dropdown).length > 0){
                if(!$('li.Hover', this.dropdown).is('li:first-child')){
                    $('li.Hover', this.dropdown).removeClass('Hover').prev().addClass('Hover');
                }
            } else {
                $('li:first', this.dropdown).addClass('Hover');
            }

        },

        dropdownNext: function(){

            if($('li.Hover', this.dropdown).length > 0){
                if(!$('li.Hover', this.dropdown).is('li:last-child')){
                    $('li.Hover', this.dropdown).removeClass('Hover').next().addClass('Hover');
                }
            } else {
                $('li:first', this.dropdown).addClass('Hover');
            }

        },

        dropdownAddItem: function(value, text, html){

            if(html == undefined){
                html = text;
            }

            if($('li[data-value="' + value + '"]', this.tokensContainer).length){
                return false;
            }

            var $this = this;
            var item = $('<li />')
                .attr('data-value', value)
                .attr('data-text', text)
                .html(html)
                .bind('click', function(){
                    $this.tokenAdd($(this).attr('data-value'), $(this).attr('data-text'));
                }).bind('mouseover', function(){
                    $(this).addClass('Hover');
                }).bind('mouseout', function(){
                    $('li', $this.dropdown).removeClass('Hover');
                });

            this.dropdown.append(item);
            return true;

        },

        dropdownHide: function(){

            this.dropdownReset();
            this.dropdown.hide();

        },

        dropdownReset: function(){

            this.dropdown.html('');

        },

        resizeSearchInput: function(){

            var measure = $('<div />')
                .css({ position: 'absolute', visibility: 'hidden' })
                .addClass('TokenizeMeasure')
                .html(this.searchInput.val());

            $('body').append(measure);

            this.searchInput.width(measure.width() + 25);
            measure.remove();

        },

        resetSearchInput: function(){

            this.searchInput.val("");
            this.resizeSearchInput();

        },

        resetPendingTokens: function(){

            $('li.PendingDelete', this.tokensContainer).removeClass('PendingDelete');

        },

        keydown: function(e){

            if(e.keyCode == this.options.validator){
                e.preventDefault();
                this.tokenAdd(this.searchInput.val(), '');
            } else {
                switch(e.keyCode){
                    case KEYS.BACKSPACE:
                        if(this.searchInput.val().length == 0){
                            e.preventDefault();
                            if($('li.Token.PendingDelete', this.tokensContainer).length){
                                this.tokenRemove($('li.Token.PendingDelete').attr('data-value'));
                            } else {
                                $('li.Token:last', this.tokensContainer).addClass('PendingDelete');
                            }

                            this.dropdownHide();
                        }
                        break;

                    case KEYS.TAB:
                    case KEYS.ENTER:
                        if($('li.Hover', this.dropdown).length){
                            var element = $('li.Hover', this.dropdown);
                            e.preventDefault();
                            this.tokenAdd(element.attr('data-value'), element.attr('data-text'));
                        } else {
                            if(this.searchInput.val()){
                                e.preventDefault();
                                this.tokenAdd(this.searchInput.val(), '');
                            }
                        }
                        this.resetPendingTokens();
                        break;

                    case KEYS.ESCAPE:
                        this.resetSearchInput();
                        this.dropdownHide();
                        this.resetPendingTokens();
                        break;

                    case KEYS.ARROW_UP:
                        e.preventDefault();
                        this.dropdownPrev();
                        break;

                    case KEYS.ARROW_DOWN:
                        e.preventDefault();
                        this.dropdownNext();
                        break;

                    default:
                        this.resetPendingTokens();
                        break;
                }
            }

        },

        keyup: function(e){

            if(e.keyCode != this.options.validator){
                switch(e.keyCode){
                    case KEYS.TAB:
                    case KEYS.ENTER:
                    case KEYS.ESCAPE:
                    case KEYS.ARROW_UP:
                    case KEYS.ARROW_DOWN:
                        break;

                    case KEYS.BACKSPACE:
                        if(this.searchInput.val()){
                            this.search();
                        } else {
                            this.dropdownHide();
                        }
                        break;
                    default:
                        if(this.searchInput.val()){
                            this.search();
                        }
                        break;
                }
            }

        },

        search: function(){

            var $this = this;
            var count = 1;

            if(this.options.datas == 'select'){

                var found = false, regexp = new RegExp(this.searchInput.val().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
                this.dropdownReset();

                $('option', this.select).not(':selected').each(function(){
                    if(count <= $this.options.nbDropdownElements){
                        if(regexp.test($(this).html())){
                            $this.dropdownAddItem($(this).attr('value'), $(this).html());
                            found = true;
                            count++;
                        }
                    } else {
                        return false;
                    }
                });

                if(found){
                    $('li:first', this.dropdown).addClass('Hover');
                    this.dropdownShow();
                } else {
                    this.dropdownHide();
                }

            } else {

                $.getJSON(this.options.datas, this.options.searchParam + "=" + this.searchInput.val(), function(data){

                    if(data){
                        var found = false;
                        $.each(data, function(key, val){
                            found = true;
                            return true;
                        });

                        if(found){
                            $this.dropdownReset();

                            $.each(data, function(key, val){
                                if(count <= $this.options.nbDropdownElements){
                                    var html = undefined;
                                    if(val.html){
                                        html = val.html;
                                    }
                                    $this.dropdownAddItem(val.value, val.text, html);
                                    count++;
                                } else {
                                    return false;
                                }
                            });

                            $('li:first', $this.dropdown).addClass('Hover');
                            $this.dropdownShow();

                            return true;
                        }
                    }

                    $this.dropdownHide();

                });

            }

        },


        tokenAdd: function(value, text, first){

            if(value == undefined || value == ''){
                return false;
            }

            if(text == undefined || text == ''){
                text = value;
            }

            if(first == undefined){
                first = false;
            }

            var $this = this;
            var close_btn = $('<a />')
                .addClass('Close')
                .html("×")
                .bind('click', function(){
                    $this.tokenRemove(value);
                });

            if($('option[value="' + value + '"]', this.select).length){
                $('option[value="' + value + '"]', this.select).attr('selected', 'selected');
            } else if(this.options.newElements) {
                var option = $('<option />')
                    .attr('selected', 'selected')
                    .attr('value', value)
                    .attr('data-type', 'custom')
                    .html(text);

                this.select.append(option);
            } else {
                return false;
            }

            if($('li.Token[data-value="' + value + '"]', this.tokensContainer).length > 0) {
                return false;
            }

            $('<li />')
                .addClass('Token')
                .attr('data-value', value)
                .append('<span>' + text + '</span>')
                .prepend(close_btn)
                .insertBefore(this.searchToken);

            if(!first){
                this.options.onAddToken(value, text);
            }

            this.resetSearchInput();
            this.dropdownHide();

            return true;

        },

        tokenRemove: function(value){

            var option = $('option[value="' + value + '"]', this.select);

            if(option.attr('data-type') == 'custom'){
                option.remove();
            } else {
                option.removeAttr('selected');
            }

            $('li.Token[data-value="' + value + '"]', this.tokensContainer).remove();

            this.options.onRemoveToken(value);
            this.resizeSearchInput();
            this.dropdownHide();

        }

    });

    $.fn.tokenize = function(options){

        if(options == undefined){
            options = {};
        }

        var opt = $.extend({}, $.fn.tokenize.defaults, options);
        var obj = new $.tokenize(opt);
        obj.init(this);

        $(this).data(DATA, obj);

        return this;

    };

    $.fn.tokenize.defaults = {

        datas: 'select',
        searchParam: 'search',
        searchMaxLength: 30,
        validator: KEYS.COMMA,
        newElements: true,
        nbDropdownElements: 10,

        onAddToken: function(value, text){},
        onRemoveToken: function(value){}

    };

})(jQuery, 'tokenize');