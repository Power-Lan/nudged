# nudged

[![NPM Version](https://img.shields.io/npm/v/nudged.svg)](https://www.npmjs.com/package/nudged)
[![Build Status](https://img.shields.io/travis/axelpale/nudged/master.svg)](https://travis-ci.org/axelpale/nudged)

**A JavaScript lib** to efficiently estimate translation, scale, and/or rotation between two sets of 2D points. We have found it to be useful in **graphics, user interfaces, multi-touch recognition, and eye tracker calibration**. In general, you can apply *nudged* in any situation where you want to move a number of points based on a few sample points and optionally one fixed pivot point. See the image below for visual explanation.

<img src="https://rawgit.com/axelpale/nudged/master/doc/figure-pointset.png" alt="Example transformation" width="500"/>

_**Figure**: Left: You have a set of points. Center: you known where three of them should be moved. Right: With *nudged*, based on the initial position of the three points and their target positions, you can estimate a transformation that nicely transforms all the rest of the points._

**Mathematically speaking**, *nudged* is a set of optimal least squares estimators for nonreflective similarity transformation matrices. Such transformations are [affine transformations](https://en.wikipedia.org/wiki/Affine_transformation) with translation, rotation, and/or uniform scaling, and without reflection or shearing. The estimation has time complexity of O(*n*), where *n* is the cardinality (size) of the point sets. In other words, *nudged* solves a 2D to 2D point set registration problem (alias [Procrustes superimposition](https://en.wikipedia.org/wiki/Procrustes_analysis)) in linear time. The algorithms and their efficiency are thoroughly described in a **M.Sc. thesis** [Advanced algorithms for manipulating 2D objects on touch screens](http://URN.fi/URN:NBN:fi:tty-201605264186).

**The development has been supported** by [Infant Cognition Laboratory](http://www.uta.fi/med/icl/index.html) at [University of Tampere](http://www.uta.fi/en/) where it is used to correct eye tracking data.

Available also [in Python](https://pypi.python.org/pypi/nudged).



## Example apps

To get a grip, play with the following demos.

### Multitouch transformation with N fingers

[<img src="https://rawgit.com/axelpale/nudged/master/examples/nudged-gesture/screenshot.jpg" alt="Four hands transforming the image simultaneously" width="600"/>](https://rawgit.com/axelpale/nudged/master/examples/nudged-gesture/index.html)

The [**touch gesture demo**](https://rawgit.com/axelpale/nudged/master/examples/nudged-gesture/index.html) takes the common pinch-zoom and rotate gestures a step further. Many multitouch apps allow you to scale and rotate with two fingers. However, usually the additional fingers are ignored. But what if one wants to use, say, both hands and all the fingers on a huge touchscreen?

For reference, the [**typical gesture demo**](https://rawgit.com/axelpale/nudged/master/examples/typical-gesture/index.html) implements similar demo with the popular [Hammer.js](http://hammerjs.github.io/) touch gesture library. As you can experience, only the first two pointers are regarded for scaling and rotation.



### Point set editor

[<img src="https://rawgit.com/axelpale/nudged/master/examples/nudged-editor/screenshot.png" alt="Nudged editor screenshot" width="600"/>](https://rawgit.com/axelpale/nudged/master/examples/nudged-editor/index.html)

The [**editor demo**](https://rawgit.com/axelpale/nudged/master/examples/nudged-editor/index.html) allows you to add domain and range points on a surface and explore how the points affect the transformation.


### Tokyo metro map viewer

[<img src="https://rawgit.com/axelpale/nudged/master/examples/nudged-map/screenshot.png" alt="A screenshot of Nudged map viewer example" width="600"/>](https://rawgit.com/axelpale/nudged/master/examples/nudged-map/index.html)

In this [map viewer demo](https://rawgit.com/axelpale/nudged/master/examples/nudged-map/index.html), nudged is used to recognize multi-touch gestures to scale, rotate, and translate [a large image](https://commons.wikimedia.org/wiki/File:Tokyo_metro_map.png) on HTML5 canvas.


## Install

With [npm](https://www.npmjs.com/package/nudged):

    $ npm install nudged



## Usage

Let `domain` and `range` be point sets before and after transformation as illustrated in the figure below:

    > var domain = [[0,0], [2,0], [ 1,2]]
    > var range  = [[1,1], [1,3], [-1,2]]

<img src="https://rawgit.com/axelpale/nudged/master/doc/simple-example-pointset.png" alt="The transformation" width="500"/>

_**Figure**: Left: the domain. Center: the range. Right: the domain after transformation._

Compute an optimal transformation based on the points:

    > var trans = nudged.estimate('TSR', domain, range)

Examine the transformation matrix:

    > trans.getMatrix()
    { a: 0, c: -1, e: 1,
      b: 1, d:  0, f: 1 }
    > trans.getRotation()
    1.5707... = π / 2
    > trans.getScale()
    1.0
    > trans.getTranslation()
    [1, 1]

Apply the transformation to other points:

    > trans.transform([2,2])
    [-1,3]

Inverse the transformation:

    > var inv = trans.inverse()
    > inv.transform([-1,3])
    [2,2]

See [API](#api) for more.


### Using pivoted transformations

You can think the pivot point as a pin pushed through a paper. The pin keeps its location intact regardless of the transformation around it, as illustrated in the figure below.

<img src="https://rawgit.com/axelpale/nudged/master/doc/simple-example-fixed.png" alt="A fixed point transformation" width="500"/>

_**Figure**: Left: a black pivot point and the domain. Center: the range. Right: the pivot and the domain after transformation._

In the following example we estimate an optimal scaling and rotation around point `[-1,0]`:

    > var pivot = [-1,0]
    > var domain = [[0,0], [2,0], [ 1,2]]
    > var range  = [[1,1], [1,3], [-1,2]]
    > var pivotTrans = nudged.estimate('SR', domain, range, pivot)

If we now apply the transformation to the domain, we see that the result is close to the range. Also, if we apply it to the pivot, the point stays the same.

    > pivotTrans.transform(domain)
    [[-0.33, 0.77], [0.99, 2.33], [-1.22, 2.88]]
    > pivotTrans.transform(pivot)
    [-1,0]



## API

Nudged API provides a class for nonreflective similarity transformations and 7 types of estimators, one for each combination of translation, scaling, and rotation. The ones without translation allow an optional fixed point.

### nudged.create(scale, rotation, translationX, translationY)

Create a transformation that scales, rotates, and translates as specified.

**Parameters:**
- *scale*: a number; the scaling factor.
- *rotation*: a number; the rotation in radians from positive x axis toward positive y axis.
- *translationX*: a number; translation after rotation, toward positive x axis.
- *translationY*: a number; translation after rotation, toward positive y axis.

The parameters are optional and default to the identity transformation.

**Return** a new `nudged.Transform` instance.

**Examples:**

    > var t0 = nudged.create()
    > t0.transform([3, 1])
    [3, 1]

    > var t1 = nudged.create(2)
    > t1.transform([3, 1])
    [6, 2]

    > var t2 = nudged.create(1, Math.PI / 2)
    > t2.transform([3, 1])
    [-1, 3]

    > var t3 = nudged.create(1, 0, 20.2, 0)
    > t3.transform([3, 1])
    [23.2, 1]


### nudged.createFromArray(arr)

Create a `nudged.Transform` instance from an array created by nudged.Transform#toArray(). Together with `nudged.Transform#toArray()` this method makes an easy **serialization and deserialization** to and from JSON possible.

    > var t1 = nudged.create(1, 2, 3, 4)
    > var arr = trans.toArray()
    > var t2 = nudged.createFromArray(arr)
    > t1.equals(t2)
    true

### nudged.estimate(type, domain, range, pivot?)

Compute an optimal affine transformation from the *domain* to *range* points. The *type* of transformation is any combination of translation `T`, scaling `S`, and rotation `R`, in this order. A special type `I` returns always the identity transformation. Transformations without translation (`S`, `R`, `SR`) allow an optional fixed *pivot* point.

**Parameters:**
- *type*: string, freedom of the transformation. Types available: `'I'`, `'T'`, `'S'`, `'R'`, `'TS'`, `'TR'`, `'SR'`, `'TSR'`
- *domain*: array of [x,y] points
- *range*: array of [x,y] points
- *pivot*: optional [x,y] point. Defaults to the origin [0,0] with types `'S'`, `'R'`, and `'SR'`.

The *domain* and *range* should have equal length. Different lengths are allowed but additional points in the longer array are ignored.

**Return** new `nudged.Transform(...)` instance.

You can also call the estimators directly:

- `nudged.estimateI()`
- `nudged.estimateT(domain, range)`
- `nudged.estimateS(domain, range, pivot)`
- `nudged.estimateR(domain, range, pivot)`
- `nudged.estimateTS(domain, range)`
- `nudged.estimateTR(domain, range)`
- `nudged.estimateSR(domain, range, pivot)`
- `nudged.estimateTSR(domain, range)`

**Example:**

    > var domain = [[0,0], [2,0], [ 1,2]]
    > var range  = [[1,1], [1,3], [-1,2]]
    > var tr = nudged.estimate('SR', domain, range)
    > tr.getScale()
    1.242259
    > tr.getRotation()
    1.107148


### nudged.version

Contains the module version string identical to the version in *package.json*.

    > nudged.version
    '1.2.3'


### nudged.Transform(s, r, tx, ty)

A constructor for a nonreflective similarity transformation. You usually do not need to call it directly because both `nudged.create(...)` and `nudged.estimate(...)` create and return instances for you. Nevertheless, if you need to create one:

    > var trans = new nudged.Transform(0.5, 0, 20, 0)

The `nudged.Transform` instance is designed to be immutable.

**Parameters** `s`, `r`, `tx`, and `ty` define the elements of an [augmented transformation matrix](https://en.wikipedia.org/wiki/Affine_transformation#Augmented_matrix) in the following manner:

    | s  -r  tx |
    | r   s  ty |
    | 0   0   1 |

Note that `s` and `r` do **not** represent scaling and rotation but instead `s = scalingFactor * Math.cos(rotationRads)` and `r = scalingFactor * Math.sin(rotationRads)`. The parameters `tx` and `ty` represent horizontal and vertical translation after rotation.

### nudged.Transform.IDENTITY

A default instance of `nudged.Transform` that represents the identity transformation `new Transform(1, 0, 0, 0)` i.e. transformation without an effect. You can use it in building new transformations:

    > var trans = nudged.Transform.IDENTITY.scaleBy(0.6).rotateBy(0.3);

### nudged.Transform.R90 .R180 .R270 .X2

Following prebuilt `Transform` instances are available:

- `R90`: clockwise 90 degree rotation. Equal to `new Transform(0, 1, 0, 0)`.
- `R180`: 180 degree rotation. Equal to `new Transform(-1, 0, 0, 0)`.
- `R270`: counterclockwise 90 degree rotation. Equal to `new Transform(0, -1, 0, 0)`.
- `X2`: scale up by the factor of two. Equal to `new Transform(2, 0, 0, 0)`.

**Example:**

    > nudged.Transform.X2.getScale()
    2

### nudged.Transform#s, #r, #tx, #ty

Elements of the internal transformation matrix. Direct use of these properties is not recommended.

    > var t = nudged.create(2, Math.PI / 2, 10, 20)
    > t.s
    1.2246e-16
    > t.r
    2
    > t.tx
    10
    > t.ty
    20

### nudged.Transform#almostEqual(tr, epsilon?)

Compare equality of two transformations and allow small differences that likely occur due to floating point arithmetics.

**Alias** `.almostEquals(tr)`

**Parameter** `tr` is an instance of `nudged.Transform`. Optional parameter `epsilon` is a small number that defines largest allowed difference and defaults to `Transform.EPSILON`. The difference is computed as the sum of absolute differences of the properties s, r, tx, and ty.

**Return** true if the parameters of the two transformations are equal or almost equal and false otherwise.

### nudged.Transform#equal(tr)

**Alias** `.equals(tr)`

**Parameter** `tr` is an instance of `nudged.Transform`.

**Return** true if the parameters of the two transformations are equal and false otherwise.

### nudged.Transform#getMatrix()

Get the transformation matrix in a format compatible with [kld-affine](https://www.npmjs.com/package/kld-affine).

**Return** an object with properties `a`, `b`, `c`, `d`, `e`, and `f`.

    > trans.getMatrix()
    { a: 0.48, c: -0.52, e: 205.04,
      b: 0.52, d: 0.48, f: 4.83 }

The properties represent the following matrix:

    | a   c   e |
    | b   d   f |
    | 0   0   1 |

### nudged.Transform#getRotation()

Get clockwise rotation from the positive x-axis.

**Return** rotation in radians.

### nudged.Transform#getScale()

**Return** scaling multiplier, e.g. `0.333` for a threefold shrink.

### nudged.Transform#getTranslation()

**Return** `[tx, ty]` where `tx` and `ty` denotes movement along x-axis and y-axis accordingly.

### nudged.Transform#toArray()

Together with `nudged.createFromArray(...)` this method makes an easy serialization and deserialization to and from JSON possible.

**Return** an array representation of the transformation: `[s, r, tx, ty]`. Note that `s` and `r` do not represent scaling and rotation but elements of the matrix.

### nudged.Transform#transform(points)

Apply the transform to a point or an array of points.

**Parameter** `points` is an array of points `[[x, y], ...]` or a single point `[x, y]`.

**Return** an array of transformed points or single point if only a point was given. For example:

    > trans.transform([1,1])
    [2,2]
    > trans.transform([[1,1]])
    [[2,2]]
    > trans.transform([[1,1], [2,3]])
    [[2,2], [3,4]]

### nudged.Transform#inverse()

**Return** a new `nudged.Transform` instance that is the inverse of the original transformation.

**Throw** an `Error` instance if the transformation is singular and cannot be inversed. This occurs if the range points are all the same which forces the scale to drop to zero.

### nudged.Transform#translateBy(dx, dy)

**Return** a new `nudged.Transform` instance where the image of the original has been translated.

### nudged.Transform#scaleBy(multiplier, pivot?)

**Parameter** `multiplier` is a number. Optional parameter `pivot` is a point `[x, y]`.

**Return** a new `nudged.Transform` instance where the image of the original has been scaled.

The scaling is done around an optional pivot point that defaults to [0,0].

### nudged.Transform#rotateBy(radians, pivot?)

**Parameter** `radians` is a number. Optional parameter `pivot` is a point `[x, y]`.

**Return** a new `nudged.Transform` instance where the image of the original has been rotated.

The rotation is done around an optional pivot point that defaults to [0,0].

### nudged.Transform#multiplyBy(tr)

**Alias** `.multiplyRight(tr)`

**Parameter** `tr` is an instance of `nudged.Transform`.

**Return** a new `nudged.Transform` instance where the original transformation matrix is multiplied from the right with the transformation matrix of `tr`.

The resulting transformation is equal to first transforming with `tr` and then with the instance. More precisely, the image of the resulting transformation is the image of `tr` transformed by the instance.



## For developers

Run lint & unit tests:

    $ npm run test

Build example apps:

    $ npm run build:examples

Start local server to try out the examples:

    $ npm start

Release:

- Bump version in package.json, `npm run gv`, and run tests.
- Build examples `npm run build:examples`
- Create release branch. See [tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).
  - `$ git checkout -b release-7.7.7 development`
- Update the [badge urls](http://shields.io/) in README.
- Update the rawgit urls in README:
  - Replace 'nudged/development' with 'nudged/master'
- Commit: `$ git commit -a -m "Clean release 7.7.7"`
- Merge (see the tutorial link above):
  - `$ git checkout master`
  - `$ git merge release-7.7.7`
  - `$ git push`
- Create [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging):
  - `$ git tag -a 7.7.7 -m "v7.7.7 Superb Name"`
  - `$ git push --tags`
- Publish to npm:
  - `$ npm publish`
- Return to development to avoid accidental master commits
  - `$ git checkout development`


## Thanks

- [Infant Cognition Laboratory at University of Tampere](http://www.uta.fi/med/icl/index.html) for funding.
- [3D Media Group at Tampere University of Technology](http://www.tut.fi/en/about-tut/departments/signal-processing/research/3d-media/) for testing devices.
- Tanja for math photos.
- Vilkku, Xiao, and Krista for fingers.


## Versioning

[Semantic Versioning 2.0.0](http://semver.org/)



## License

[MIT License](../blob/master/LICENSE)
