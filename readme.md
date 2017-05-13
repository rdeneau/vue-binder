## Synopsis

Basic and lightweight M-V-VM two-way binding library, written in TypeScript, based on [jQuery](http://jquery.com/) and inspired by [VueJS](https://vuejs.org/), except that the data in the view takes precedence over the data in the model.

## Code Example

See `./example` folder, starting with `index.html` (in french) and `main.ts`.

## Motivation

- Educational: writing a view binder just to toggle visibility of parts of a form depending on some of its inputs.
- Skip full MVVM binder like VueJS or [KnockoutJS](http://knockoutjs.com/), but keep a data attributes oriented view binding, for a use with ASP.NET MVC and especially its Ajax form.

## Installation

Just run `npm i` to download NPM packages used by `vue-binder` (jQuery) and the example: [Bootstrap](http://getbootstrap.com/), [FontAwesome](http://fontawesome.io/), [MomentJS](http://momentjs.com/).

## API Reference

### HTML

Syntax uses `date-vue-xxx` attributes on HTML elements.

- `data-vue-show="expression"` attribute is used to toggle visibility of a HTML element. Its value is a valid boolean javascript expression, using the implicit variable `model` to access the model properties:
  ```html
  <div id="majorInfo" data-vue-show="model.isMajor">...</div>
  <div id="redInfo" data-vue-show="model.color==='red'">...</div>
  ```
- Use `date-vue-model[='name']` attribute on `input` and `select` tags which values are used for toggling. The name of the property feeded in the model is given by the first non empty value of one of the attributes `date-vue-model`, `name`, `id`. Hence, if you have set the field name attribute, you can leave the `date-vue-model` attribute empty.
  ```html
  <input type="text" id="address1" data-vue-model>
  <input type="text" name="address2" data-vue-model>
  <input type="text" data-vue-model="address3">
  ```
- Model properties can be nested:
  ```html
  <input type="text" name="address.line1" value="L1" data-vue-model>
  <input type="text" name="address.line2" value="L2" data-vue-model>
  ```
  ```js
  model === {
      address: {
          line1: "L1",
          line2: "L2"
      }
  }
  ```
- Model properties are typed:
  - implicitly: `boolean` for checkbox, `number` for input[type=number], else `string` or
  - explicitly: with the `data-vue-type` attribute with the value `boolean`, `date` or `number`.
  - Parsing and formatting can be customized with the `converters` option.

### JavaScript/TypeScript

Accessible through the global namespace `Vue`. Not compatible with module.

Instanciate class `Vue.Binder` on document ready, specifying the desired options:
- All options are optional.
- `root`: selector of the root HTML element inside which doing all the bindings. Default: `body`.
- `model`: object instance of the model.
  - Use it if you need to access model properties, typed them or add extra properties that can be used in the view for toggling elements without source fields.
  - See `example/personne.ts` where properties are defined with their type (note the enum `TypePersonne` and the `data-vue-type="number"` in `index.html`) and used in computed properties `IsAdherentInconnu`, `IsAdherentRenseigne` and `ShowPersonne`, and method `searchByNumeroAdherent()`.
- `listener`: callback to be notified for each property value change in a field.
  - In the example, the listener is used for log purpose and to do additional work: search for a customer by its number and disabled fields filled by the customer search.
  - Note: the changes of extra properties, not bound to a field, are not notified.
- `converters`: helpers to customize formatting and parsing of value by type: `boolean`, `date` and `number`. 2 defaults converters can be used: see `Vue.localeConverters`. You can be pick one and extend it for a particular use, like in the example that uses momentJS to handle date in french format.

Notes:
- Model property bound to a field is transformed into getter/setter (like with VueJS) so that setting the value of a model property change the bound field(s) value.
- Binding between model properties and view fields are dynamically done so that you can add/change/remove fields under the root element without the need to rebind view and model.
- Visibility toggling is triggered at each field value change. It can be triggered manually calling the `refresh` method of the `Vue.Binder` instance.
