"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/clone-deep";
exports.ids = ["vendor-chunks/clone-deep"];
exports.modules = {

/***/ "(ssr)/./node_modules/clone-deep/index.js":
/*!******************************************!*\
  !*** ./node_modules/clone-deep/index.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\n/**\n * Module dependenices\n */\n\nconst clone = __webpack_require__(/*! shallow-clone */ \"(ssr)/./node_modules/shallow-clone/index.js\");\nconst typeOf = __webpack_require__(/*! kind-of */ \"(ssr)/./node_modules/kind-of/index.js\");\nconst isPlainObject = __webpack_require__(/*! is-plain-object */ \"(ssr)/./node_modules/is-plain-object/index.js\");\n\nfunction cloneDeep(val, instanceClone) {\n  switch (typeOf(val)) {\n    case 'object':\n      return cloneObjectDeep(val, instanceClone);\n    case 'array':\n      return cloneArrayDeep(val, instanceClone);\n    default: {\n      return clone(val);\n    }\n  }\n}\n\nfunction cloneObjectDeep(val, instanceClone) {\n  if (typeof instanceClone === 'function') {\n    return instanceClone(val);\n  }\n  if (instanceClone || isPlainObject(val)) {\n    const res = new val.constructor();\n    for (let key in val) {\n      res[key] = cloneDeep(val[key], instanceClone);\n    }\n    return res;\n  }\n  return val;\n}\n\nfunction cloneArrayDeep(val, instanceClone) {\n  const res = new val.constructor(val.length);\n  for (let i = 0; i < val.length; i++) {\n    res[i] = cloneDeep(val[i], instanceClone);\n  }\n  return res;\n}\n\n/**\n * Expose `cloneDeep`\n */\n\nmodule.exports = cloneDeep;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvY2xvbmUtZGVlcC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYjtBQUNBO0FBQ0E7O0FBRUEsY0FBYyxtQkFBTyxDQUFDLGtFQUFlO0FBQ3JDLGVBQWUsbUJBQU8sQ0FBQyxzREFBUztBQUNoQyxzQkFBc0IsbUJBQU8sQ0FBQyxzRUFBaUI7O0FBRS9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtCQUFrQixnQkFBZ0I7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdm9pY2UtYXNzaXN0YW50LWZyb250ZW5kLy4vbm9kZV9tb2R1bGVzL2Nsb25lLWRlZXAvaW5kZXguanM/ODFhZCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuaWNlc1xuICovXG5cbmNvbnN0IGNsb25lID0gcmVxdWlyZSgnc2hhbGxvdy1jbG9uZScpO1xuY29uc3QgdHlwZU9mID0gcmVxdWlyZSgna2luZC1vZicpO1xuY29uc3QgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2lzLXBsYWluLW9iamVjdCcpO1xuXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsLCBpbnN0YW5jZUNsb25lKSB7XG4gIHN3aXRjaCAodHlwZU9mKHZhbCkpIHtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgcmV0dXJuIGNsb25lT2JqZWN0RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpO1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiBjbG9uZUFycmF5RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpO1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybiBjbG9uZSh2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZU9iamVjdERlZXAodmFsLCBpbnN0YW5jZUNsb25lKSB7XG4gIGlmICh0eXBlb2YgaW5zdGFuY2VDbG9uZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpbnN0YW5jZUNsb25lKHZhbCk7XG4gIH1cbiAgaWYgKGluc3RhbmNlQ2xvbmUgfHwgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3RvcigpO1xuICAgIGZvciAobGV0IGtleSBpbiB2YWwpIHtcbiAgICAgIHJlc1trZXldID0gY2xvbmVEZWVwKHZhbFtrZXldLCBpbnN0YW5jZUNsb25lKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG5mdW5jdGlvbiBjbG9uZUFycmF5RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpIHtcbiAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICByZXNbaV0gPSBjbG9uZURlZXAodmFsW2ldLCBpbnN0YW5jZUNsb25lKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgY2xvbmVEZWVwYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEZWVwO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/clone-deep/index.js\n");

/***/ })

};
;