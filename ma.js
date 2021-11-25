

(() => {
	const [BOTTOM_LEFT, BOTTOM_RIGHT, BOTTOM, LEFT, RIGHT, TOP_LEFT, TOP_RIGHT, TOP] = [1, 2, 3, 4, 5, 6, 7, 8]
	let	sizeSet = window.eval(atob("W1szMDAsIDYwMF0sIFsxMjAsIDYwMF0sIFszMjAsIDUwXSwgWzcyOCwgOTBdLCBbMzAwLCAyNTBdLCBbMzIwLCAxMDBdLCBbMTYwLCA2MDBdXQ=="))
			.sort((a, b) => -(a[0] * a[1] - b[0] * b[1]))
	let positionSet = [BOTTOM_LEFT, BOTTOM_RIGHT, BOTTOM, LEFT, RIGHT, TOP_LEFT, TOP_RIGHT, TOP]
	let fallbackSizeSet = window.eval(atob("W1s3MjgsIDkwXSwgWzMyMCwgMTAwXSwgWzMyMCwgNTBdXQ=="))
	let fallbackPositionSet = [BOTTOM]
	let organicLookTreshold = 2
	let closeButtonSpace = 18
	let body = document.body
	let adRoot = document.createElement("div")
	let adHeader = document.createElement("div")
	let adHeaderInner = document.createElement("div")
	let adPlacement = document.createElement("div")
	let adHeaderWidth = Math.min(100, sizeSet.map(t => t[0]).reduce((t, e) => e < t ? e : t, window.innerWidth))
	let adSlot = null
	let lastRefreshTime = 0
	let nextRefreshTryTime = 1500
	let lastAdLoadTime = 0
    let firstLoop = true
	let useSSL = 'https:' == document.location.protocol
	const networkId = atob("LzIxNjMzMTUyMzA5L2FwbGR5bmFtaWNmb3JhbGwvZHluYW1pYzgyNDA=")
	const defineSlotFunctonName = atob("ZGVmaW5lU2xvdA==")
	const maxAllowedZIndex = 2147483647

    window.adipolo = window.adipolo || {}
	window.adipolo.settings = {
        refreshTimer: 30000,
        mobileTreshhold: 500, // max width of the screen to be considered mobile
		dynamicAd: {
            quanity: 1,
            mainLoopTimer: 2000,
            minimumFallbackRetentionTime: 10000
        },
        videoPlayer: {
            videoInjectionPointId: 'adipolo-video-injector',
            divClassDefinedInABackend: 'aplvideo1',
            tagId:'61992cbaac2e72626d7a238a',
            publisherId: '6194e37dd64d962c3c046ac4'
        },
        designatedAd: {
            injectionPointClass: 'adipolo-injector',
            maxSize: [970, 250],
            maxSizeMobile: [320, 100],
        }
	}
    let dynamicAd = {
        isClosed: false,
        actualPosition: null,
    }
    let designatedAd = {
        injectionPoints: [] // type: [{element: ElementRef, isClosed: boolean, size: [number, number]}]
    }

	adHeader.style.backgroundColor = "black"
	adHeader.style.color = "white"
	adHeader.style.width = `${adHeaderWidth + 3}px`
	adHeader.style.height = closeButtonSpace
	adHeader.style.maxWidth = "100%"
	adHeader.style.direction = "ltr"

	let adHeaderShadowRoot = adHeader.attachShadow({ mode: "open" })
	adPlacement.style.overflow = "hidden"
	adHeaderInner.style.direction = "ltr"
	adHeaderInner.style.lineHeight = `${closeButtonSpace}px`
	adHeaderInner.style.fontSize = `${closeButtonSpace}px`
	window.googletag = window.googletag || { cmd: [] }

	function getScrollbarWidth() { 
		return window.innerWidth - document.documentElement.clientWidth 
	}

	function isMobile() {
        return window.innerWidth < window.adipolo.settings.mobileTreshhold
    }

	let clientWidth = window.innerWidth - getScrollbarWidth()
	let	clientHeight = window.innerHeight - getScrollbarWidth()

	function getPositionSizeRect(position, size) {
        let [x, y] = size
        let [w, h] = [clientWidth, clientHeight]
        if (position === TOP_LEFT) {
            return { top: 0, left: 0, right: x, bottom: y + closeButtonSpace }
        }
        if (position === LEFT) {
            return { top: (h - y) / 2 - closeButtonSpace, left: 0, right: x, bottom: (h + y) / 2 }
        }
        if (position === TOP) {
            return { top: 0, left: (w - x) / 2, right: (w + x) / 2, bottom: y + closeButtonSpace }
        }
        if (position === BOTTOM_LEFT) {
            return { top: h - y - closeButtonSpace, left: 0, right: x, bottom: h }
        }
        if (position === TOP_RIGHT) {
            return { top: 0, left: w - x, right: w, bottom: y + closeButtonSpace }
        }
        if (position === BOTTOM) {
            return { top: h - y  - closeButtonSpace, left: (w - x) / 2, right: (w + x) / 2, bottom: h }
        }
        if (position === RIGHT) {
            return { top: (h - y) / 2 - closeButtonSpace, left: w - x, right: w, bottom: (h + y) / 2 }
        }
        if (position === BOTTOM_RIGHT) {
            return { top: h - y - closeButtonSpace, left: w - x, right: w, bottom: h }
        }
	}

	function getCloseButtonLocation(position) {
		if (position === TOP_LEFT || position === TOP || position === TOP_RIGHT) {
            return BOTTOM
        } else {
            return TOP
        }
	}
	
   // gives back object that can inform css animation how to behave
   function getLocationsForAnimation(position, size) {
		let [x, y] = size
		let sizeRect = getPositionSizeRect(position, size)
		let [rectX, rectY] = [sizeRect.right - sizeRect.left, sizeRect.bottom - sizeRect.top]
		
		// commes from the left
		if (position === BOTTOM_LEFT && x <= y) {
			return {
				before: `bottom: 0; left: ${-rectX}px`,
				after: `bottom: 0; left: 0`,
				animatedProperty: 'left'
			}
		}
		if (position === LEFT) {
			return {
				before: `top: calc(50vh - ${rectY / 2}px); left: ${-rectX}px`,
				after: `top: calc(50vh - ${rectY / 2}px); left: 0`,
				animatedProperty: 'left'
			}
		}
		if (position === TOP_LEFT && x <= y) {
			return {
				before: `top: ${sizeRect.top}px; left: ${-rectX}px`,
				after: `top: ${sizeRect.top}px; left: 0`,
				animatedProperty: 'left'
			}
		}

		// commes from the top
		if (position === TOP_RIGHT && x > y) {
			return {
				before: `top: ${-rectY - closeButtonSpace}px; right: 0`,
				after: `top: 0; right: 0`,
				animatedProperty: 'top'
			}
		}
		if (position === TOP) {
			return {
				before: `top: ${-rectY - closeButtonSpace}px; left: calc(50vw - ${rectX / 2}px)`,
				after: `top: 0; left: calc(50vw - ${rectX / 2}px)`,
				animatedProperty: 'top'
			}
		}
		if (position === TOP_LEFT && x > y) {
			return {
				before: `top: ${-rectY - closeButtonSpace}px; left: ${sizeRect.left}px`,
				after: `top: 0; left: ${sizeRect.left}px`,
				animatedProperty: 'top'
			}
		}

		// commes from the right
		if (position === BOTTOM_RIGHT && x <= y) {
			return {
				before: `bottom: 0; right: ${-rectX}px`,
				after: `bottom: 0; right: 0`,
				animatedProperty: 'right'
			}
		}
		if (position === RIGHT) {
			return {
				before: `top: calc(50vh - ${rectY / 2}px); right: ${-rectX}px`,
				after: `top: calc(50vh - ${rectY / 2}px); right: 0`,
				animatedProperty: 'right'
			}
		}
		if (position === TOP_RIGHT && x <= y) {
			return {
				before: `top: ${sizeRect.top}px; right: ${-rectX}px`,
				after: `top: ${sizeRect.top}px; right: 0`,
				animatedProperty: 'right'
			}
		}

		// commes from the bottom
		if (position === BOTTOM_RIGHT && x > y) {
			return {
				before: `bottom: ${-rectY}px; right: 0`,
				after: `bottom: 0; right: 0`,
				animatedProperty: 'bottom'
			}
		}
		if (position === BOTTOM) {
			return {
				before: `bottom: ${-rectY}px; left: calc(50vw - ${rectX / 2}px)`,
				after: `bottom: 0; left: calc(50vw - ${rectX / 2}px)`,
				animatedProperty: 'bottom'
			}
		}
		if (position === BOTTOM_LEFT && x > y) {
			return {
				before: `bottom: ${-rectY}px; left: ${sizeRect.left}px`,
				after: `bottom: 0; left: ${sizeRect.left}px`,
				animatedProperty: 'bottom'
			}
		}
	}
	
    // checks if a rectangle fits in client area
    function fitsInWindow(rect) {
        return !(rect.top < 0 || rect.left < 0 || rect.right > clientWidth || rect.bottom > clientHeight)
    }

    // checks if a rectangle intersects with window
    function intersectsWithWindow(rect) {
        return !(rect.top > clientHeight || rect.left > clientWidth || rect.right < 0 || rect.bottom < 0)
    }

    // return maximum possible size of the ad in a proposed designated slot
    function getMaxVisibleSize(injectionPoint, maxSize) {
        const rect = injectionPoint.getBoundingClientRect()
        if (rect.top < 0 || rect.left < 0 || rect.top > window.innerHeight || rect.right > window.innerWidth) {
            return [0, 0] // ad is not visible, is outside of the screen
        }
        for (let i=0; i<sizeSet.length; i++) {
            const size = sizeSet[i]
            if (size[0] > maxSize[0] || size[1] > maxSize[1]) {
                continue
            }
            const tryRect = {
                top: rect.top,
                left: clientWidth / 2 - size[0]/2, // element is centered
                right: clientWidth / 2 + size[0]/2, // element is centered
                bottom: rect.top + size[1]
            }
            if (fitsInWindow(tryRect)) {
                return size
            }
        }
        return [0, 0]
    }

	// checks 2 rectangles for intersecton
	function intersects(r1, r2) {
		return !(r2.left > r1.right || 
			r2.right < r1.left || 
			r2.top > r1.bottom ||
			r2.bottom < r1.top)
	}

	// finds if there is any intersection between content holding tags and a given rectangle on the screen
    function doesIntersect(leafes, sizeRect) {
        return leafes
            .map(l => l.getBoundingClientRect())
            .reduce((acc, x) => acc || intersects(x, sizeRect), false)
    }

	function extractMaxZIndex(element) {
        if (!element) {
            return 0
        }
        const style = window.getComputedStyle(element)
        let max = 0
        if (isFinite(style.zIndex)) {
            max = Math.max(0, style.zIndex)
        }
        
        let children = element.children
        if (children && children.length > 0) {
            for (let i = 0; i < children.length; i++) {
                max = Math.max(max, extractMaxZIndex(children[i]))
            }
        }
        max = Math.min(max, maxAllowedZIndex)
        return max
    }

	// checks if PositionAndSize proposal is looking organically.
	function isPositionSizeOrganicLooking(position, size) {
		let [x, y] = size
		let t = organicLookTreshold
		if (position === TOP_LEFT || position === BOTTOM_LEFT || position === TOP_RIGHT || position === BOTTOM_RIGHT) {
			return x <= t * y && y <= t * x
		}
		let [w, h] = [clientWidth, clientHeight]
		if (position === LEFT || position === RIGHT) {
			return y >= t * x
		}
		if (position === TOP || position === BOTTOM) {
			return x >= t * y
		}
	}

	function extractFixedElements(element) {
        if (!element || element.tagName.toLowerCase() === 'script') {
            return []
        }
        const style = window.getComputedStyle(element)
        if (style.visibility === 'hidden' || style.display === 'none') {
            return [] // element not visible
        }
        if (style.position === 'fixed') {
            return [ element ]
        }

        let children = element.children
        if (children && children.length > 0) {
            let leafesArray = []
            for (let i = 0; i < children.length; i++) {
                leafesArray = [...leafesArray, ...extractFixedElements(children[i])]
            }
            return leafesArray
        }

        return []
    }

	// extranct content elements from the page. Returns only elements that have something user-readable on them, like text and images
	function extractLeafes(element) {
		if (!element || element.tagName.toLowerCase() === 'script') {
			return []
		}
		const style = window.getComputedStyle(element)
		if (style.visibility === 'hidden' || style.display === 'none') {
			return [] // element not visible
		}

		let children = element.children
		if (children && children.length > 0) {

			// svg is a content
			if (element.tagName.toLowerCase() === 'svg') { 
				return [ element ]
			}

			// tag with it's own text is a content
			let text = element.textContent.trim()
			for (let i = 0; i < children.length; i++) {
				text = text.replace(children[i].textContent.trim(), '').trim()
			}
			if (text.length > 0) {
				// tag with its own text is a content
				return [ element ]
			}

			let leafesArray = []
			for (let i = 0; i < children.length; i++) {
				leafesArray = [...leafesArray, ...extractLeafes(children[i])]
			}
			return leafesArray
		} else { // tag with no children is a content
			if (element.tagName.toLowerCase() === 'br') {
				return []
			}

			const knownTextTags = ['span', 'a', 'div', 'li', 'th', 'td', 'p']
			if ( knownTextTags.some(tag => element.tagName.toLowerCase() === tag) ) {
				let text = element.textContent.trim()
				if (!text || text.length === 0) {
					return []
				}
			}
			return [ element ]
		}
	}

    // finds where is the best PositionAndSize to put the ad in
    function findBestFit(leafes, fixedElements) {
        // console.log('findBestFit')
        let bestFit = null // type PositionAndSize is: {size: [number, number], position: string, isFallback: boolean}
        sizeSet.forEach(size => { // looking for the non-fallback position
            positionSet.forEach(pos => {
                if (bestFit) {
                    return
                }
                if (!isPositionSizeOrganicLooking(pos, size)) {
                    return
                }
                
                let sizeRect = getPositionSizeRect(pos, size)
                if (fitsInWindow(sizeRect)) {
                    let doesIntersectWithLeafElements = doesIntersect(leafes, sizeRect)
                    if(!doesIntersectWithLeafElements) {
                        bestFit = {size: size, position: pos, sizeRect: sizeRect, isFallback: false }
                    }
                }
            })
        })
        if(!bestFit) { // looking for a fallback position
            fallbackSizeSet.forEach(size => {
                fallbackPositionSet.forEach((pos, iPos) => {
                    if (bestFit) {
                        return
                    }
                    let sizeRect = getPositionSizeRect(pos, size)
                    let doesIntersectWithFixedElements = doesIntersect(fixedElements, sizeRect)
                    if (!doesIntersectWithFixedElements && fitsInWindow(sizeRect)) {
                        bestFit = {size: size, position: pos, sizeRect: sizeRect, isFallback: true }
                        return
                    }
                    if (iPos + 1 === fallbackPositionSet.length) { // second fallback
                        if (fitsInWindow(sizeRect)) {
                            bestFit = {size: size, position: pos, sizeRect: sizeRect, isFallback: true }
                            return
                        }
                    }
                })
            })
            
        }
        return bestFit
    }

	function removeFromParent(element) {
        if (element && element.parentElement) {
            element.parentElement.removeChild(element)
        }
    }

	function rollTheAdIn(positionAndSize) {
		let maxZIndex = extractMaxZIndex(body)
		if (!isFinite(maxZIndex)) {
            maxZIndex = maxAllowedZIndex
        }
		let animLocs = getLocationsForAnimation(positionAndSize.position, positionAndSize.size)
		const width = positionAndSize.sizeRect.right - positionAndSize.sizeRect.left
		const height = positionAndSize.sizeRect.bottom - positionAndSize.sizeRect.top
		let cssStyle = `position: fixed; display: flow-root; z-index: ${maxZIndex + 1}; ${animLocs.before}; width: ${width}px; height: ${height}px; background: none`
		while (adRoot.firstChild) {
			removeFromParent(adRoot.firstChild)
		}
		removeFromParent(adRoot)

		if (getCloseButtonLocation(positionAndSize.position) === TOP) {
            adHeader.style.borderRadius = `0 ${closeButtonSpace}px 0 0`
            adRoot.appendChild(adHeader)
        }

		adRoot.appendChild(adPlacement)
		adPlacement.style.width = positionAndSize.size[0]
		adPlacement.style.height = positionAndSize.size[1]

		if (getCloseButtonLocation(positionAndSize.position) === BOTTOM) {
            adHeader.style.borderRadius = `0 0 ${closeButtonSpace}px 0`
            adRoot.appendChild(adHeader)
        }

		body.appendChild(adRoot)
		adRoot.setAttribute("style", cssStyle)
		loadTheAd(positionAndSize)
		lastAdLoadTime = Date.now()
		setTimeout(() => {
			cssStyle = `position: fixed; display: flow-root; z-index: ${maxZIndex + 1}; ${animLocs.after}; width: ${width}px; height: ${height}px; background: none; transition: ${animLocs.animatedProperty} 0.5s ease-in-out 1s`
			adRoot.setAttribute("style", cssStyle)
		}, 10)
	}

	function loadTheAd(positionAndSize) {
		var timeNow = Date.now()
		const targetDiv = `div-gpt-ad-${timeNow}-0`
        lastRefreshTime = timeNow
		window.googletag.cmd.push(function () {
			adSlot = googletag[defineSlotFunctonName](networkId, positionAndSize.size, targetDiv)
				.setTargeting("refresh", "true")
				.setTargeting("test", "event")
				.addService(googletag.pubads())
			googletag.pubads().disableInitialLoad()
			googletag.pubads().addEventListener("slotRenderEnded", function (event) {
				if (event.slot.getSlotElementId() == targetDiv) {
					if (event.isEmpty) {
						rollTheAdOut(positionAndSize)
						setTimeout(() => !dynamicAd.isClosed && rollTheAdIn(positionAndSize), nextRefreshTryTime)
						nextRefreshTryTime = Math.round(1.5 * nextRefreshTryTime)
					} else {
						nextRefreshTryTime = 2000
					}
				}
			})
			googletag.enableServices()
		})
		adPlacement.setAttribute("id", targetDiv)
		googletag.cmd.push(function () {
			googletag.display(targetDiv)
		})
		googletag.cmd.push(function () {
			googletag.pubads().refresh([adSlot])
		})
	}

	function rollTheAdOut(positionAndSize) {
		var width = positionAndSize.sizeRect.right - positionAndSize.sizeRect.left
		var	height = positionAndSize.sizeRect.bottom - positionAndSize.sizeRect.top
		var	positionAndSize = getLocationsForAnimation(positionAndSize.position, positionAndSize.size)
		positionAndSize = `position: fixed; display: flow-root; ${positionAndSize.before}; width: ${width}px; height: ${height}px;background: none; transition: ${positionAndSize.animatedProperty} 0.5s ease-in-out 0s`
		adRoot.setAttribute("style", positionAndSize)
		setTimeout(() => adRoot && adRoot.parentElement && adRoot.parentElement.removeChild(adRoot), 1000)
	}

	function arePositionAndSizeTheSame(a, b) {
		return a.position === b.position && a.size[0] === b.size[0] && a.size[1] === b.size[1]
	}

	function refreshTheAdIfTimesOut() {
		timeNow = Date.now()
		if (!dynamicAd.isClosed && !document.hidden && dynamicAd.actualPosition 
				&& timeNow - lastRefreshTime >= window.adipolo.settings.refreshTimer) {
			// console.log('ad Refresh')
			loadTheAd(dynamicAd.actualPosition)
		}
	}

	// this is the main function of a dynamic ad module
	window.adipolo.mainLoop = () => {
        if (dynamicAd.isClosed) { // the ad had been closed by the user
            return
        }
        let mainTimer = window.adipolo.settings.dynamicAd.mainLoopTimer
        
        if ( document.readyState !== "complete" || document.hidden || !body || !body.children ) {
            setTimeout(() => window.adipolo.mainLoop(), 200)
            return
        }
        console.log('mainLoop', mainTimer, isMobile())
        
        // designated ad code
        let designatedAdSettings = window.adipolo.settings.designatedAd
        let maxSize = isMobile() ? designatedAdSettings.maxSizeMobile : designatedAdSettings.maxSize
        let newInjectors = Array.from(body.getElementsByClassName(designatedAdSettings.injectionPointClass))
            .filter(i => !designatedAd.injectionPoints.some(p => p.element === i))
            .map(element => ({
                element: element,
                isClosed: false
            }))
        designatedAd.injectionPoints = designatedAd.injectionPoints.concat(newInjectors)
        designatedAd.injectionPoints.forEach(p => {
            p.maxSize = getMaxVisibleSize(p.element, maxSize)
        })
        designatedAd.injectionPoints
            .filter(p => !p.isClosed)
            // .filter(p => !p.actualSize)
            .filter(p => p.maxSize[0] + p.maxSize[1] > 0)
            .forEach(p => {
                p.actualSize = p.maxSize
                p.element.innerHTML = `
                    <div style="background-color:lime; 
                        width: ${p.actualSize[0]}px; height: ${p.actualSize[1]}px;
                        left: calc(50% - ${p.actualSize[0]/2}px);
                        position: relative;">
                        injection point
                    </div>`
            })
            // position: relative;
            // left: calc(50% - ${p.actualSize[0]/2}px);
        designatedAd.injectionPoints
            .filter(p => p.actualSize)
            .filter(p => !intersectsWithWindow(p.element.getBoundingClientRect()))
            .forEach(p => {
                p.actualSize = null
                p.element.innerHTML = ''
            })
        console.log('designatedAd.injectionPoints', designatedAd.injectionPoints)




        // dynamic ad code
        let dynamicAdSettings = window.adipolo.settings.dynamicAd
        if (dynamicAdSettings.quanity < 1) {
            console.log('dynamicAdSettings.quanity < 1')
            setTimeout(() => window.adipolo.mainLoop(), mainTimer)
            return
        }

        let actualPosition = dynamicAd.actualPosition
        let sizeRect = actualPosition && getPositionSizeRect(actualPosition.position, actualPosition.size)

        // fallback retention time - for fallback ad position to not be removed too fast
        if (actualPosition && actualPosition.isFallback
				&& Date.now() - lastAdLoadTime < dynamicAdSettings.minimumFallbackRetentionTime
				&& fitsInWindow(sizeRect)) {
            console.log('fallback retention time')
            setTimeout(() => window.adipolo.mainLoop(), mainTimer)
            return
        }

        clientWidth = window.innerWidth - getScrollbarWidth()
        clientHeight = window.innerHeight - getScrollbarWidth()

		refreshTheAdIfTimesOut()
        
        let leafes = []
        let fixedElements = []
        for (let i = 0; i < body.children.length; i++) {
            if (body.children[i] === adRoot) {
                continue
            }
            leafes = [...leafes, ...extractLeafes(body.children[i])]
            fixedElements = [...fixedElements, ...extractFixedElements(body.children[i])]
        }

		let bestFit = findBestFit(leafes, fixedElements)
		// console.log('best fit', bestFit)

        // check if there is an intersect with normal (not fallback) position
        if (actualPosition && !actualPosition.isFallback) {

            if (bestFit && bestFit.isFallback && arePositionAndSizeTheSame(actualPosition, bestFit)) {
				// console.log('new bestFit is a fallback of the same position')
				setTimeout(() => window.adipolo.mainLoop(), mainTimer)
				return
			}

            if ( !fitsInWindow(sizeRect) || doesIntersect(leafes, sizeRect) ) {
				// console.log('intersect: roll out', fitsInWindow(sizeRect), doesIntersect(leafes, sizeRect))
                rollTheAdOut(actualPosition)
                dynamicAd.actualPosition = null
            }
			// console.log('has normal position: nothing happened')
            setTimeout(() => window.adipolo.mainLoop(), mainTimer)
            return
        }

        // check if fallback position can be replaced with a better fit
        if (actualPosition && actualPosition.isFallback ) {
            if ((bestFit && !bestFit.isFallback) || !fitsInWindow(sizeRect)) {
                // comparing positions
                if (!arePositionAndSizeTheSame(actualPosition, bestFit)) {
					// console.log('fallback: roll out')
                    rollTheAdOut(actualPosition)
                    dynamicAd.actualPosition = null
                }
            }
		    // console.log('fallback: nothing happened')
            setTimeout(() => window.adipolo.mainLoop(), mainTimer)
            return
        }

        if(bestFit) {
            dynamicAd.actualPosition = bestFit
            removeFromParent(adRoot)
            rollTheAdIn(bestFit)
        } else {
            adRoot.setAttribute('style', `display: none`)
        }
        
		// console.log('nothing happened', firstLoop)
        setTimeout(() => window.adipolo.mainLoop(), firstLoop ? 1 : mainTimer)
        firstLoop = false
    }

	
	window.adipolo.close = () => { 
		dynamicAd.isClosed = true
		if (dynamicAd.actualPosition) {
			rollTheAdOut(dynamicAd.actualPosition) 
		}
	}

	adHeaderInner.innerHTML = `<span style="margin-left: 2px; vertical-align: middle; cursor: pointer; font-family: Arial, Helvetica, sans-serif; font-size: ${closeButtonSpace - 2}px; line-height: ${closeButtonSpace}px;" onclick="window.adipolo.close()"> X </span>
		<a href="http://www.adipolo.com" style="vertical-align: middle;"><img style="margin-left: 1px; margin-top: -2px; max-height: ${closeButtonSpace - 2}px; max-width: ${adHeaderWidth - 2 * closeButtonSpace}px;" src="https://adipolo.com/wp-content/uploads/2020/06/adipolo_logo.png"></a>`
	adHeaderShadowRoot.appendChild(adHeaderInner)

	function loadScript(src, callback) {
        let ready = false
        let script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = src
		script.async = true
        script.onload = script.onreadystatechange = function() {
            // console.log( 'readyState', this.readyState ) //uncomment this line to see which ready states are called.
            if ( !ready && (!this.readyState || this.readyState == 'complete') ) {
                ready = true
                if (callback) {
                    callback()
                }
            }
        }
        var headNode = document.getElementsByTagName('head')
        headNode = (headNode && headNode.length > 0) ? headNode[0] : body
        headNode.appendChild(script)
    }

    function googletagLoader(callback) {
        let src = (useSSL ? 'https:' : 'http:') +
            '//www.googletagservices.com/tag/js/gpt.js'
		loadScript(src, callback)
    }

    window.adipolo.videoPlayerLoader = () => {
        let playerSettings = window.adipolo.settings.videoPlayer
        let videoDiv = document.createElement('div')
        videoDiv.classList.add(playerSettings.divClassDefinedInABackend)
        let videoScript = document.createElement('script')
        videoScript.id = 'AV'+playerSettings.tagId;
        videoScript.async = true
        videoScript.type = 'text/javascript'
        let scriptUrl = atob('Ly90ZzEubW9kb3JvMzYwLmNvbS9hcGkvYWRzZXJ2ZXIvc3B0P0FWX1RBR0lEPQ==')
        videoScript.src = (useSSL ? 'https:' : 'http:') + scriptUrl +
            `${playerSettings.tagId}&AV_PUBLISHERID=${playerSettings.publisherId}`

        if (body.firstChild) {
            body.insertBefore(videoDiv, body.firstChild)
        } else {
            body.appendChild(videoDiv)
        }
		videoDiv.appendChild(videoScript)

		let scriptReady = false
		videoScript.onload = videoScript.onreadystatechange = function() {
            if ( !scriptReady && (!this.readyState || this.readyState == 'complete') ) {
                scriptReady = true
				let injectionPoint = document.getElementById(playerSettings.injectionPointId)
				if (injectionPoint && videoDiv) {
					removeFromParent(videoDiv)
					injectionPoint.parentElement.insertBefore(videoDiv, injectionPoint)
				}
            }
        }

    }

	googletagLoader(() => {
        console.log('googletag loaded')
        window.adipolo.mainLoop()
    });

	window.adipolo.videoPlayerLoader()


})();


