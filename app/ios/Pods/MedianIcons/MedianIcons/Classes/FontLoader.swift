//
//  FontLoader.swift
//  MedianIcons
//
//  Created by Hunaid Hassan on 30.04.22.
//

import Foundation

public class FontLoader {
    class func loadFont(_ fontName: String, fromBundle bundle: Bundle) {
        let paths = bundle.paths(forResourcesOfType: "ttf", inDirectory: nil)
        var fontURL = URL(string: "")
        var error: Unmanaged<CFError>?

        paths.forEach {
            guard let filename = NSURL(fileURLWithPath: $0).lastPathComponent,
                filename.lowercased().range(of: fontName.lowercased()) != nil else {
                    return
            }

            fontURL = NSURL(fileURLWithPath: $0) as URL
        }

        guard let unwrappedFontURL = fontURL,
            let data = try? Data(contentsOf: unwrappedFontURL),
            let provider = CGDataProvider(data: data as CFData) else {

                return
        }

        let font = CGFont.init(provider)

        guard let unwrappedFont = font,
            !CTFontManagerRegisterGraphicsFont(unwrappedFont, &error),
            let unwrappedError = error,
            let nsError = (unwrappedError.takeUnretainedValue() as AnyObject) as? NSError else {

            return
        }

        let errorDescription: CFString = CFErrorCopyDescription(unwrappedError.takeUnretainedValue())

        NSException(name: NSExceptionName.internalInconsistencyException,
                    reason: errorDescription as String,
                    userInfo: [NSUnderlyingErrorKey: nsError]).raise()
    }
}
