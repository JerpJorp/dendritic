// https://github.com/valery-barysok/json-cycle#readme
export class Cycle {

    // console.log(JSON.stringify(Cycle.decycle(a)));
    static decycle(object: any) {

        var objects: any[] = [],   // Keep a reference to each unique object or array
            paths: string[] = [];     // Keep the path to each unique object or array

        return (function derez(value: any, path: string) {

            // The derez recurses through the object, producing the deep copy.

            let i = 0;
            let name = '';
            let nu: any | undefined;

            var _value = value && value.toJSON instanceof Function ? value.toJSON() : value;
            // typeof null === 'object', so go on if this value is really an object but not
            // one of the weird builtin objects.

            if (typeof _value === 'object' && _value !== null) {

                // If the value is an object or array, look to see if we have already
                // encountered it. If so, return a $ref/path object. This is a hard way,
                // linear search that will get slower as the number of unique objects grows.

                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === _value) {
                        return { $ref: paths[i] };
                    }
                }

                // Otherwise, accumulate the unique value and its path.

                objects.push(_value);
                paths.push(path);

                // If it is an array, replicate the array.

                if (Object.prototype.toString.apply(_value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < _value.length; i += 1) {
                        nu[i] = derez(_value[i], path + '[' + i + ']');
                    }
                } else {

                    // If it is an object, replicate the object.

                    nu = {};
                    for (name in _value) {
                        if (Object.prototype.hasOwnProperty.call(_value, name)) {
                            nu[name] = derez(_value[name],
                                path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            }
            return _value;
        }(object, '$'));
    }

    //Cycle.retrocycle(JSON.parse(s));
    static retrocycle($: any) {

        var px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value: any) {

            // The rez function walks recursively through the object looking for $ref
            // properties. When it finds one that has a value that is a path, then it
            // replaces the $ref object with a reference to the value that is found by
            // the path.

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    }
}