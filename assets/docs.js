function processAuthor(author) {
    var email = null;
    var author = $.trim(author.replace(/\(([^\)]+)\)/, function(mch,eml){ email = eml; return ''; }));
    return (email !== null) ? '<a class="author" href="mailto:' +email+ '">' +author+ '</a>' : '<span class="author">' +author+ '</span>';
}

function headingDepth(depth) {

}

function paragraph(p_node) {
    return '<p>' + getDescription(p_node) + '</p>';
}

function html(h_node) {
    return '<span class="markup">' + Wui.Smarty.prototype.escape(h_node.value, 'html') + '</span>';
}

function inlineCode() {
    return html.apply(null, arguments);
}

function heading(h_node) {
    var depth = h_node.depth;
    if (depth != 1) {
        depth += 1;
    }

    return '<h' + depth + '>' + h_node.children.map(function(text) {
            return Wui.Smarty.prototype.escape(text.value, 'html');
        }).join(' ') + '</h' + depth + '>';
}

function list(l_node) {
    return '<ul>' + getDescription(l_node) + '</ul>';
}

function listItem(li_node) {
    return '<li>' + getDescription(li_node) + '</li>';
}

function text(t_node) {
    return Wui.Smarty.prototype.escape(t_node.value, 'html');
}

function code(c_node) {
    return '<pre><code class="language-js">' +  Wui.Smarty.prototype.escape(c_node.value, 'html') + '</pre></code>';
}

function link(l_node) {
    return '<a target="_blank" href="' + l_node.url + '">' + getDescription(l_node.children[0]) + '</a>';
}

function otherType(node) {
    console.log('Unrecognized type!: ' + (node.type || ''), node);
    return text.apply(null, arguments);
}

function getDescription(desc_object) {
    var desc = '';

    if (Wui.isset(desc_object) && $.isArray(desc_object.children)) {
        desc_object.children.forEach(function(child) {
            try {
                desc += window[child.type](child);
            }
            catch(e) {
                return otherType(child);
            }
        });
    }
    else if (Wui.isset(desc_object)) {
        try {
            desc += window[desc_object.type](desc_object);
        }
        catch(e) {
            return otherType(desc_object);
        }
    }

    return desc;
}


/**
 * Parses out a type object into an alternately formatted object containing a string and HTML
 * version of the type.
 *
 * @param   {object}    typeObj     An object produced by the node.js documentation package.
 *
 * @returns {object}    An alternately formatted object containing plain and HTML strings.
 */
function getType(typeObj) {
    var ret_obj = {
        text: 'undefined',
        html: 'undefined'
    };

    if (Wui.isset(typeObj)) {
        switch(typeObj.type) {
            case 'NameExpression':
                ret_obj.html = ret_obj.text = typeObj.name.toLowerCase();
                break;
            case 'OptionalType':
                ret_obj = getType(typeObj.expression.expression || typeObj.expression);
                ret_obj.html = '<span class="optional-type">' + ret_obj.html + '</span>';
                break;
            case 'UnionType':
                ret_obj.html = ret_obj.text = typeObj.elements.map(function(expr) {
                    return getType(expr).text
                }).join('|');
                break;
            case 'TypeApplication':
                var expression = getType(typeObj.expression);
                ret_obj.html = ret_obj.text = expression.text + ' of ' + getType(typeObj.applications[0]).text + '(s)';
                break;
            default:
                console.log('Unrecognized type:', typeObj);
        }
    }

    return ret_obj;
}


/**
 * Returns a name of the parameter with parent objects stripped. Also, if the name ends with
 * a double underscore, '__', then it is assumed to be a multiple and is expanded to show that.
 */
function paramName(name) {
    var base_name;

    if(name.substr(-2) == '__') {
        base_name = name.substr(0, name.length - 2).split('.').pop();

        return base_name + '1, ' + base_name + '2, ...';
    }
    else {
        return name.split('.').pop();
    }
}

/**
 * Creates the HTML for the class or function parameters
 * @param   {array}     returns     Array of objects containing parameter descriptions.
 * @param   {jQuery}    title       The jQuery wrapped HTMLElement that has the title of the function.
 * @param   {jQuery}    target      The jQuery wrapped HTMLElement that is the target for a function's
 *                                  description and properties.
 *
 * @returns {jQuery}    The newly created params list that gets added to target
 */
function process_params(params, title, target) {
    var params_parens = $('<span class="param-list"></span>');
    var params_list = $('<ul>');
    var params_names = [];

    if (typeof params != 'undefined' && params.length > 0) {
        title.append(params_parens);
        target.append(params_list);

        params.forEach(function(param) {
            var param_li;
            var type_obj = getType(param.type);

            // Because we can be dealing with sub properties, just get the last item after the dot.
            var param_name = paramName(param.name);

            params_names.push(param_name);

            // Create the list item
            params_list.append(
                param_li = $('<li><span class="param_name">' + param_name + '</span></li>').append(
                    '<span class="param_type">' + type_obj.html + '</span>',
                    getDescription(param.description)
                )
            );

            // Additional properties are added as a sub-list
            if (typeof param.properties != 'undefined') {
                process_params(param.properties, $(undefined), param_li)
            }
        });

        params_parens.append(params_names.join(', '));
    }

    return params_list;
}

/**
 * Creates the HTML for the return items
 *
 * @param   {array}     returns     Return objects
 * @param   {jQuery}    title       The jQuery wrapped HTMLElement that has the title of the function.
 * @param   {jQuery}    target      The jQuery wrapped HTMLElement that is the target for a function's
 *                                  description and properties.
 */
function process_returns(returns, title, target) {
    var returns_parens = $('<span class="returns-list"></span>');
    var return_item = $('<div class="return-item">');

    if (typeof returns != 'undefined' && returns.length > 0) {
        title.prepend(returns_parens);
        target.append(return_item);

        returns.forEach(function(return_obj) {
            var type_obj = getType(return_obj.type);

            returns_parens.append(type_obj.text);
            return_item.append(
                '<span class="returns_type">' + type_obj.html + '</span>',
                getDescription(return_obj.description)
            );
        });
    }
}

$('#docs-container').children('div').each(function(index, target) {
    var file;

    target = $(target);
    file = target.attr('id');

    // Set panel to open or closed based on local storage
    if (localStorage.getItem(file) === 'closed') {
        target.addClass('collapsed-panel');
        target.find('.toggle-view').text('+');
    }

    // Get the item's documentation
    $.ajax({
        url: 'dist/docs/' +file+ '.json',
        success: function(data) {
            data.forEach(function(member) {
                var title = (member.kind != 'class' && member.kind != 'namespace') ? '<h2>' + member.name + '</h2>' : undefined;

                // Append title and description
                target.append(
                    title = $(title),
                    getDescription(member.description)
                );

                // Append an author if there is one
                if (typeof member.author != 'undefined') {
                    target.append(processAuthor(member.author));
                }

                // Check if there are holes in the documentation engine
                if (member.kind === undefined) {
                    console.log('Unrecognized member kind: ', member);
                };

                // Process parameters for functions and classes
                if (member.kind == 'function' || member.kind == 'class') {
                    process_params(member.params, title, target).addClass(((member.kind == 'class') ? 'class-params' : ''));
                }

                if (member.kind == 'function') {
                    process_returns(member.returns, title, target);
                }
            });

            Prism.highlightAll();
        }
    });
});


$('.toggle-view').on('click', function() {
    var button = $(this);
    var parent = button.parent();
    var id = parent.attr('id');

    if (parent.hasClass('collapsed-panel')) {
        parent.removeClass('collapsed-panel');
        button.text('-');
        localStorage.setItem(id, 'open');
    }
    else {
        parent.addClass('collapsed-panel');
        button.text('+');
        localStorage.setItem(id, 'closed');
    }
});