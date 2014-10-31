/*------------------------------------*\
    $%SUMMARY
\*------------------------------------*/

/**
 * SUMMARY.............It's me !
 * GLOBAL..............Define global variables.
 * COMMON..............This functions are used on more one page, and execute on each pages.
 * ARTICLE.............This functions are used only on associate template.
 * LOGIN.............This functions are used only on associate template.
 * START PROCESS.......Run all JavaScript common / specific.
 */





/*------------------------------------*\
    $%GLOBAL
\*------------------------------------*/

var website = website || {},
    $window = $(window),
    $html = $("html"),
    $body = $("body"),
    $base = $("base");


/*------------------------------------*\
    $%COMMON
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {},
        socket = io.connect();

    publics.minified = ($html.attr("class").indexOf("min") > -1) ? ".min" : "";

    publics.isEditable = false;

    publics.cleanDataEdit = function ($object) {
        $object.removeAttr("data-edit-targeted");
        $object.find('[data-edit-targeted=true]').removeAttr("data-edit-targeted");
        return $object;
    }

    publics.targetDataEdit = function () {
        function clone(obj) {
            if (null == obj || "object" != typeof obj) return obj;
            var copy = obj.constructor();
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
            }
            return copy;
        }

        $("[data-edit=true]").each(function (i) {
            var $currentDataEdit = $(this),
                $popup = $(".popup");

            $currentDataEdit.attr('data-edit-targeted', true);

            $currentDataEdit.click(function (e) {
                var $editedObject = $(this),
                    options = {},
                    $template,
                    $clone,
                    content,
                    name,
                    accept = false;

                if (publics.isEditable) {
                    e.preventDefault();

                    $popup.addClass("opened");

                    if ($editedObject.data("edit-type") === "html" &&
                        $popup.find("." + $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).length === 0) 
                    {
                        $template = $(".popup .template.html");
                        $clone = $template.clone().removeClass("template");
                        $clone = publics.cleanDataEdit($clone);
                        $popup.find(".insert").before($clone);
                        $clone.find("label").addClass($editedObject.data('edit-path'));
                        $clone.find("label .info").text($editedObject.data('edit-file') + " > " + $editedObject.data('edit-path'));
                        if ($editedObject.data('edit-source')) {
                        	$clone.find("textarea").hide();
							socket.emit('source-variation', {
								path: $editedObject.data('edit-path'),
								file: $editedObject.data('edit-file')
							});
                        } else {
                        	$clone.find("textarea").val($editedObject.html().trim());
	                        $clone.find("textarea").keyup(function () {
	                            $('[data-edit-path='+ $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html($clone.find("textarea").val());
	                        });
                        }
                        privates.editedObjects.push($editedObject);
                        publics.targetDataEdit();
                    }

                    if ($editedObject.data("edit-type") === "text" &&
                        $popup.find("." + $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).length === 0) 
                    {
                        $template = $(".popup .template.text");
                        $clone = $template.clone().removeClass("template");
                        $clone = publics.cleanDataEdit($clone);
                        $popup.find(".insert").before($clone);
                        $clone.find("label").addClass($editedObject.data('edit-path'));
                        $clone.find("label .info").text($editedObject.data('edit-file') + " > " + $editedObject.data('edit-path'));
                        if ($editedObject.data('edit-source')) {
							$clone.find("input").hide();
							socket.emit('source-variation', {
								path: $editedObject.data('edit-path'),
								file: $editedObject.data('edit-file')
							});
                        } else {
                        	$clone.find("input").val($editedObject.text().trim());
	                        $clone.find("input").keyup(function () {
	                            $('[data-edit-path='+ $editedObject.data('edit-path').replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html($clone.find("input").val());
	                        });
                        }
                        privates.editedObjects.push($editedObject);
                        publics.targetDataEdit();
                    }

                    if ($editedObject.data("edit-attr") === true) {
                        for (var i in $editedObject.data()) {
                            (function () {
                                var name;
                                if (i.indexOf('editAttrName') !== -1) {
                                    name = i.replace('editAttrName', '').toLowerCase();

                                    if ($popup.find("." + $editedObject.data('edit-attr-path-' + name).replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).length === 0) {
                                        accept = true;
                                        $template = $(".popup .template.text");
                                        $clone = $template.clone().removeClass("template");
                                        $clone = publics.cleanDataEdit($clone);
                                        $popup.find(".insert").before($clone);
                                        $clone.find("label").addClass($editedObject.data('edit-attr-path-' + name));
                                        $clone.find("label .info").text($editedObject.data('edit-attr-file-' + name) + " > " + $editedObject.data('edit-attr-path-' + name));
                                        if ($editedObject.data('edit-attr-source-' + name)) {
											$clone.find("input").hide();
											socket.emit('source-variation', {
												path: $editedObject.data('edit-attr-path-' + name),
												file: $editedObject.data('edit-attr-file-' + name)
											});
				                        } else {
		                        	 		$clone.find("input").val($editedObject.attr(name).trim());
	                                        $clone.find("input").keyup(function () {
	                                            var currentName = currentName || clone(name);
	                                            $('[data-edit-attr-path-' + currentName + '='+ $editedObject.data('edit-attr-path-' + currentName).replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').attr(currentName, $(this).val());
	                                        });
				                        }
                                    }
                                }
                            }())
                        }
                        if (accept) {
                            publics.targetDataEdit();
                            privates.editedObjects.push($editedObject);
                        }
                    }
                }
            });
        });
    };

    publics.editContent = function () {
        var ctrlIsPressed = false,
            $popup = $(".popup");

        privates.editedObjects = [];

        // Ctrl is currently press ?
        $(document).keyup(function(e) {
            if (!e.ctrlKey) {
                ctrlIsPressed = e.ctrlKey;
                publics.isEditable = false;
                $html.removeClass("is-editable");
            }
        }).keydown(function(e) {
            if (e.ctrlKey) {
                ctrlIsPressed = e.ctrlKey;
                publics.isEditable = true;
                $html.addClass("is-editable");
            }
        });

        $(".popup .update-variation-change").click(function () {
            var options = [],
                currentOptions,
                name;
                
            if (!website.isEditable) {

                for (var i = 0, l = privates.editedObjects.length; i < l; i++) {
                    if (privates.editedObjects[i].data('edit-type') === 'html') {
                        currentOptions = {};

                        currentOptions.file = privates.editedObjects[i].data("edit-file");
                        currentOptions.path = privates.editedObjects[i].data("edit-path");
                        currentOptions.source = privates.editedObjects[i].data("edit-source");
                        currentOptions.type = 'html';
                        currentOptions.value = $(".popup ." + privates.editedObjects[i].data("edit-path").replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next().val().trim();
                        options.push(currentOptions);
                    }

                    if (privates.editedObjects[i].data('edit-type') === 'text') {
                        currentOptions = {};

                        currentOptions.file = privates.editedObjects[i].data("edit-file");
                        currentOptions.path = privates.editedObjects[i].data("edit-path");
                        currentOptions.source = privates.editedObjects[i].data("edit-source");
                        currentOptions.type = 'text';
                        currentOptions.value = $(".popup ." + privates.editedObjects[i].data("edit-path").replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next().val().trim();
                        options.push(currentOptions);
                    }

                    if (privates.editedObjects[i].data('edit-attr') === true) {
                        for (var j in privates.editedObjects[i].data()) {
                            if (j.indexOf('editAttrName') !== -1) {
                                name = j.replace('editAttrName', '').toLowerCase();

                                currentOptions = {};

                                currentOptions.file = privates.editedObjects[i].data("edit-attr-file-" + name);
                                currentOptions.path = privates.editedObjects[i].data("edit-attr-path-" + name);
                                currentOptions.type = 'attr';
                                currentOptions.source = privates.editedObjects[i].data("edit-attr-source-" + name);
                                currentOptions.attrName = name;
                                currentOptions.value = $(".popup ." + privates.editedObjects[i].data("edit-attr-path-" + name).replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next().val().trim();
                                options.push(currentOptions);
                            }
                        }
                    }
                }

                publics.sendContent(options);

                privates.editedObjects = [];
                $(".popup .html:not(.template)").remove();
                $(".popup .text:not(.template)").remove();

                $popup.removeClass("opened");
            }
        });

        $(".popup .next-variation-change").click(function () {
            $popup.removeClass("opened");
        });

        publics.targetDataEdit();
    };

    publics.sendContent = function (options) {
        socket.emit('update-variation', options);
    };

    publics.sourceContent = function (options) {
		socket.on('source-variation', function (data) {
			var area = $(".popup ." + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]")).next();
			area.show();
			area.val(data.value);
			area.next().show();
		});
    };

    publics.broadcastContent = function (options) {
        socket.on('update-variation', function (data) {
            if (data.type === 'html') {
                $('[data-edit-path=' + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').html(data.value);
            } 
            if (data.type === 'text') {
                $('[data-edit-path=' + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').text(data.value);
            }
            if (data.type === 'attr') {
                $('[data-edit-attr-path-' + data.attrName + '=' + data.path.replace(/\./g, "\\\.").replace(/\[/g, "\\\[").replace(/\]/g, "\\\]") + ']').attr(data.attrName, data.value);
            }
        });
    };

    publics.jQueryUiLoading = function (callback) {
        Modernizr.load({
            test: $('script[src="javascript/jquery/jquery-ui' + publics.minified + '.js"]').length === 0,
            yep: [
                'stylesheets/jquery/jquery-ui' + publics.minified + '.css',
                'javascript/jquery/jquery-ui' + publics.minified + '.js',
                'javascript/jquery/jquery.timepicker' + publics.minified + '.js'
            ],
            complete: function () {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
    };

     publics.prettifyLoad = function () {
        var $sh = $(".prettyprint");

        prettyPrint();

        $sh.mouseleave(function () {
        	$.data(this, "draggable", false);
            $.data(this, "offset", 0);
        }).mousedown(function (e) {
        	$.data(this, "draggable", true);
            $.data(this, "offset", e.pageX);
        }).mouseup(function () {
            $.data(this, "draggable", false);
            $.data(this, "offset", 0);
        }).mousemove(function (e) {
            if ($(this).data("draggable")) {
            	console.log($(this).data("draggable"));
            	console.log($(this).data("offset"));
                $(this).scrollLeft(parseInt($(this).scrollLeft() + ($(this).data("offset") - e.pageX), 10));
                $.data(this, "offset", e.pageX);
            }
        }).data("draggable", false).data("offset", 0);
    };

    publics.disqusLoading = function () {
        var disqus_shortname = 'lesieur',
            disqus_identifier = $("article.article").data("urn"),
            disqus_url = $(".permalink span").text().split("?")[0];

        if ($("article.article").length !== 0) {   
            Modernizr.load({
                test: $('script[src="//' + disqus_shortname + '.disqus.com/embed.js"]').length === 0,
                yep: '//' + disqus_shortname + '.disqus.com/embed.js',
                complete: function () {
                    DISQUS.reset({
                      reload: true,
                      config: function () {
                        this.page.identifier = disqus_identifier;
                        this.page.url = disqus_url;
                      }
                    });
                }
            });
        }
    };

    publics.disqusNumberLoading = function () {
        var add = "&1=",
            chaine = "/count-data.js",
            $listOfArticles = $("a[data-disqus-identifier]"),
            options;

        if ($listOfArticles.length > 0) {
            $listOfArticles.each(function () {
                chaine = chaine + add + $(this).data("disqus-identifier")
            });
                
            options = {
                host: 'lesieur.disqus.com',
                path: chaine.replace(/^\/count-data.js&/g,"/count-data.js?") + "&random=" + (Math.random() * 10000)
            }

            socket.emit('update-comment-number', options);

            socket.on('update-comment-number', function (data) {
                for (var i = 0; i < data.counts.length; i++) {
                    $("a[data-disqus-identifier=" + data.counts[i].id + "]").each(function () {
                        $(this).find(".set-number").text(data.counts[i].comments);
                        if (data.counts[i].comments > 1) {
                            $(this).find("[data-ins]").text($(this).find("[data-ins]").data("ins"));
                        } else {
                            $(this).find("[data-ins]").text("");
                        }
                    });
                }
            });
        }
    };

    publics.googleAnalytics = function () {
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

          ga('create', 'UA-51063761-1', 'lesieur.name');
          ga('require', 'displayfeatures');
          ga('send', 'pageview');
    };

    publics.init = function () {
        publics.googleAnalytics();
        publics.disqusNumberLoading();
        publics.editContent();
        publics.broadcastContent();
        publics.sourceContent();
    };
}(website));





/*------------------------------------*\
    $%ARTICLE
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {},
        socket = io.connect();

    privates.uploadImage = function () {
        var $formAvatar = $(".form-upload-avatar"),
            $imageAvatar = $(".image-upload-avatar"),
            $fileAvatar = $(".file-upload-avatar"),
            $buttonAvatar = $(".button-upload-avatar");

        $buttonAvatar.click(function () {
            if ($fileAvatar !== '') {
                $formAvatar.submit();
            }
        });
 
        $formAvatar.submit(function (event) {
            event.preventDefault();

            $(this).ajaxSubmit({
                error: function (xhr) {
                    console.log('Error: ' + xhr.status);
                },
                success: function(response) {
                    $imageAvatar.attr("src", $base.attr("href") + response.url);
                    $fileAvatar.attr("data-url", response.url);
                }
            });    
         });
    };

    privates.createArticle = function () {
        $(".create-article-button").click(function () {
            var $this = $(this);

            socket.emit('create-article-button', {
                title: $("#create-article-title").val(),
                urn: $(".no-article").data("urn")
            });
        });
    };

    privates.deleteArticle = function () {
        var deleteButton = $(".delete-article-button");

        deleteButton.click(function () {

            var prompt = window.prompt(deleteButton.data("prompt"), "");

            socket.emit('delete-article-button', {
                urn: $("article.article").data("urn")
            });
        });
    };

    privates.listeningDeleteArticle = function () {
        socket.on('delete-article-button', function (data) {
            location.href = $base.attr("href") + data.urn + "/";
        });
    };

    privates.updateArticle = function () {
        var $title = $(".content h1"),
            $content = $(".text"),
            $categoriesTitle = $(".categories h3"),
            $categoriesList = $(".categories li"),
            $date = $(".published a"),
            $article = $("article.article"),
            $script = $(".script"),
            $stylesheet = $(".stylesheet"),
            $fieldPublished,
            $fieldMarkdown,
            $select = $('<select class="field-categories">'),
            $categorieDelete,
            $categoriesAdd,
            categoriesSelector = ".categories select option",
            $categoryUl = $(".categories ul");

        function deleteCategory ($item) {
            $item.parents("li:first").remove();
        }

        socket.on('update-article-load-content', function (data) {
            // Title part.
            $title.after(
                $('<input type="text" class="field-title like-h1">').val($title.html())
            ).css("display", "none");

            // Script part.
            $content.after(
                $('<textarea class="field-script" cols="30" rows="10" placeholder="Script">')
            ).css("display", "none");
            $(".field-script").val($script.html());

            // Stylesheet part.
            $content.after(
                $('<textarea class="field-stylesheet" cols="30" rows="10" placeholder="Stylesheet">')
            ).css("display", "none");
            $(".field-stylesheet").val($stylesheet.html());

            // Published part.
            $content.after('<span class="field-published"><input type="checkbox"> Visible ?</span>');
            $fieldPublished = $(".field-published input");
            $fieldPublished.attr('checked', ($article.attr("data-published") === "true"));

            // Markdown part.
            $content.after('<span class="field-markdown"><input type="checkbox"> Markdown ?</span>');
            $fieldMarkdown = $(".field-markdown input");
            $fieldMarkdown.attr('checked', ($article.attr("data-markdown") === "true"));

            // Text part.
            $content.after(
                $('<textarea class="field-content" cols="30" rows="30">')
            ).css("display", "none");
            $(".field-content").val(data.content)

            // Categories Part
            $select.find("option").remove();
            $select.append(
                $('<option value="">').text("----")
            )

            for (var i = 0; i < data.categories.length; i++) {
                $select.append(
                    $('<option value="' + data.categories[i].urn + '">').text(data.categories[i].title)
                )
            }
            $categoriesTitle.append($select);

            $select.change(function () {
                var passed = false;

                $(categoriesSelector + ":selected").each(function() {
                    var $this = $(this),
                        passed = false,
                        $checkCategory = $(".categories li");

                    if ($this.val() !== "") {

                        passed = true;

                        $checkCategory.each(function (j) {
                            if ($checkCategory.eq(j).data("urn") === $this.val())
                            passed = false
                        });

                        if (passed) {
                            $categoriesAdd = $('<li data-urn="' + $this.val() + '">')
                                .html('<a href="' + $categoryUl.data("url").replace(/%urn%/g, $this.val()) + '" title="' + $categoryUl.data("title") + " " + $this.text() + '">' + $this.text() + '</a><strong> X</strong></li>');

                            $categoryUl.append( $categoriesAdd );

                            $categoriesAdd.find("strong").click(function () {
                                deleteCategory($(this));
                            });
                        }

                        $(categoriesSelector).removeAttr("selected");
                        $(categoriesSelector + '[value=""]').attr("selected", "selected");
                    }
                });
            });

            $categoriesList.append(
                $("<strong>").text(" X")
            );

            $categorieDelete = $(".categories li strong");

            $categorieDelete.click(function () {
                deleteCategory($(this));
            });

            // Date part.
            website.jQueryUiLoading(function () {
                $date.after(
                    $('<input type="text" class="field-date">').val($date.find("time").attr("datetime").replace("T"," ").replace(".000", ""))
                ).css("display", "none");

                $categoryUl.sortable();

                $(".field-date").datetimepicker({
                    dateFormat: "yy-mm-dd",
                    timeFormat: "HH:mm:00",
                    changeMonth: true,
                    changeYear: true
                });
            });
        });

        $(".update-article-button").click(function () {
            var $this = $(this),
                $fieldTitle,
                $fieldContent,
                $fieldDate,
                $fieldScript,
                $fieldStylesheet,
                fieldsCategory = [],
                $categories = $(".categories li");

            if (!$this.data("state")) {
                $this.data("state", true);

                socket.emit('update-article-load-content', {
                    urn: $article.data("urn")
                });
            } else {
                $fieldTitle = $(".field-title");
                $fieldContent = $(".field-content");
                $fieldDate = $(".field-date");
                $fieldScript = $(".field-script");
                $fieldStylesheet = $(".field-stylesheet");

                $categories.each(function (i) {
                    fieldsCategory.push($categories.eq(i).data("urn"));
                });

                socket.emit('update-article-button', {
                    urn: $article.data("urn"),
                    title: $fieldTitle.val(),
                    content: $fieldContent.val(),
                    script: $fieldScript.val(),
                    stylesheet: $fieldStylesheet.val(),
                    publishedDate: $fieldDate.val(),
                    categories: fieldsCategory,
                    published: $fieldPublished.prop("checked"),
                    markdown: $fieldMarkdown.prop("checked")
                });

                $this.data("state", false);
            }
        });
    };

    privates.listeningCreateArticle = function () {
        socket.on('create-article-button', function (data) {
            location.href = $base.attr("href") + data.urn + "/";
        });
    };

    privates.listeningUpdateArticle = function () {
        var $title = $(".content h1"),
            $titlePage = $("title"),
            $content = $(".text"),
            $script = $(".script"),
            $stylesheet = $(".stylesheet"),
            $article = $("article.article"),
            $date = $(".published a");

        socket.on('update-article-button-all', function (data) {
            var date = new Date(data.publishedDate.replace(/ /g, "T") + ".000+02:00"),
                formatDate = website.module.extendedFormatDate(date, data.variation.dates),
                month = date.getMonth() + 1,
                newDateTitle = data.variation.listDate.linkMonth.title.replace(/%year%/g, date.getFullYear()).replace(/%month%/g, data.variation.dates.months[date.getMonth()]),
                newDateHref;

            month = ((month.toString().length > 1) ? '' : '0') + month;
            newDateHref = data.variation.listDate.linkMonth.href.replace(/%year%/g, date.getFullYear()).replace(/%month%/g, month);

            if ($article.length !== 0) {
                $titlePage.text(data.title.replace(/<\/?span>/g, ""));
                $title.html(data.title);
                $content.html(data.content);
            }

            $date.find("time").html(formatDate.string);
            $date.find("time").attr("datetime", formatDate.time);
            $date.attr("title", newDateTitle);
            $date.attr("href", newDateHref);
            $article.attr("data-markdown", data.markdown);
            $article.attr("data-published", data.published);
            $stylesheet.html(data.stylesheet);
            $script.html(data.script);

            if (data.script) {
                $script.after(
                    $('<script class="script" type="text/javascript">').html(data.script)
                );
                $script.remove();
            }

            website.prettifyLoad();
        });

        socket.on('update-article-button-others', function (data) {
            var $article = $("article.article");

            if ($article.length !== 0) {
                if (data.published.toString() !== $article.attr("data-published").toString()) {
                    location.reload();
                }
            } else {
                if (data.published) {
                    location.reload();
                }
            }
        });

        socket.on('update-article-button', function () {
            var $fieldTitle = $(".field-title"),
                $fieldContent = $(".field-content"),
                $fieldDate = $(".field-date"),
                $fieldMarkdown = $(".field-markdown"),
                $fieldPublished = $(".field-published"),
                $fieldScript = $(".field-script"),
                $fieldStylesheet = $(".field-stylesheet"),
                $categoriesTitle = $(".field-categories"),
                $categoriesList = $(".categories li strong");

            $title.css("display", "");
            $content.css("display", "");
            $date.css("display", "");
            $fieldTitle.remove();
            $fieldContent.remove();
            $fieldDate.remove();
            $fieldPublished.remove();
            $fieldScript.remove();
            $fieldStylesheet.remove();
            $categoriesTitle.remove();
            $categoriesList.remove();
            $fieldMarkdown.remove();
        });
    };

    privates.treeOfHeaders = function (elements, level) {
        var groups = [],
            j = -1;

        function nextDepth() {
            if (typeof groups[j] !== 'undefined' &&
                typeof groups[j].headers !== 'undefined') 
            {
                groups[j].headers = privates.treeOfHeaders(groups[j].headers, level + 1);
            }
        }

        for (var i = 0; i < elements.length; i++) {
            
            if (elements[i][0].nodeName === "H" + level) {

                nextDepth();

                // Passage à l'élément suivant.
                j++;

                if (typeof groups[j] === 'undefined') {

                    groups[j] = {};
                }

                groups[j].header = elements[i];                    

            }

            if (typeof groups[j] !== 'undefined' &&
                elements[i][0].nodeName !== "H" + level) 
            {

                if (typeof groups[j].headers === 'undefined') {
                    groups[j].headers = [];
                }

                groups[j].headers.push(elements[i]);
            }
        }

        nextDepth();

        return groups;
    };

    privates.constructSummary = function (headers, $appendTo) {
        var $ul, $li, $a;

        for (var i = 0; i < headers.length; i++) {
            $a = $('<a>');
            $li = $('<li>');
            $ul = $('<ul>');

            $a.text(headers[i].header.text());
            $a.attr("title", headers[i].header.text());
            if (headers[i].header[0].nodeName !== "H1") {
                $a.attr("href", $(".permalink span").text() + "#" + headers[i].header.attr("id"));
            } else {
                $a.attr("href", $(".permalink span").text() + "#content");
            }

            $li.append($a);
            $ul.append($li);
            $appendTo.append($ul);

            if (headers[i].headers) {
                privates.constructSummary(headers[i].headers, $li);
            }
        }
    };

    privates.summary = function () {
        var array = [];
        $("article h1, article h2, article h3, article h4, article h5, article h6").each(function () {
            array.push($(this));
        });
    
        privates.constructSummary(privates.treeOfHeaders(array, 1), $('.summary'));
    };

    publics.init = function () {
        privates.createArticle();
        privates.listeningCreateArticle();
        privates.updateArticle();
        privates.listeningUpdateArticle();
        privates.deleteArticle();
        privates.listeningDeleteArticle();
        website.prettifyLoad();

        privates.summary();

        website.disqusLoading();
    };
}(website.article = {}));





/*------------------------------------*\
    $%LOGIN
\*------------------------------------*/

(function (publics) {
    "use strict";

    var privates = {},
        socket = io.connect();

    privates.accountLogin = function () {
        $(".account-login-button").click(function () {
            var data = {
                email: $("#account-login-email").val(),
                password: $("#account-login-password").val()
            }

            socket.emit('account-login', data);
        });
    };

    privates.listeningAccountLogin = function () {
        socket.on('account-login', function (data) {
            if (data.authSuccess) {
                location.reload();
            } else {
                $(".submit .errors ").show();
            }
        });
    };

    privates.accountLogout = function () {
        $(".account-logout-button").click(function () {
            if (!website.isEditable) {
                socket.emit('account-logout', {});
            }
        });
    };

    privates.listeningAccountLogout = function () {
        socket.on('account-logout', function (data) {
            location.reload();
        });
    };

    publics.init = function () {
        privates.accountLogin();
        privates.listeningAccountLogin();
        privates.accountLogout();
        privates.listeningAccountLogout();
    };
}(website.login = {}));





/*------------------------------------*\
    $%START PROCESS
\*------------------------------------*/

$(function () {
    "use strict";

    var specific = $body.attr("class").split(" ")[0].replace(/-/g, '');

    // Launch Common JavaScript.
    website.init();

    // Launch Specific JavaScript.
    if (website[specific] !== undefined) {
        website[specific].init();
    } else {
        //console.log('No JavaScript for ' + specific);
    }
});