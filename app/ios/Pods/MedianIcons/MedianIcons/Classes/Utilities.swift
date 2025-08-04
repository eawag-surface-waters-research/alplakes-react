//
//  Utilities.swift
//  MedianIcons
//
//  Created by Hunaid Hassan on 17.04.22.
//

import Foundation

class Utilities {
    class func hexStringFromColor(color: UIColor) -> String {
        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0
        var a: CGFloat = 0
        
        color.getRed(&r, green: &g, blue: &b, alpha: &a)

        let hexString = String.init(format: "#%02lX%02lX%02lX%02lX", lroundf(Float(r * 255)), lroundf(Float(g * 255)), lroundf(Float(b * 255)), lroundf(Float(a * 255)))

        return hexString
     }
    
    class func generateFilePath(for iconName: String, fontName: String, fontSize: CGFloat, color: UIColor) -> String {
        let hexColor = hexStringFromColor(color: color)
        let fileName = String(format: "%@GNIcons_%@_%@_%.f_%@.png", NSTemporaryDirectory(), fontName, iconName, fontSize, hexColor)

        return fileName
    }
    
    class func glyphFromIconName(_ iconName: String, font: Font) -> String {
        if let url = font.bundle.url(forResource: font.glyphMapFile, withExtension: "json") {
            do {
                let data = try Data(contentsOf: url)
                let glyphMap = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as! [String: Int]
                let hyphenIconCode = String(iconName.suffix(from: iconName.firstIndex(of: "-")!))
                let iconCode = String(hyphenIconCode.suffix(hyphenIconCode.count - 1))
                if (glyphMap[iconCode] == nil) {
                    return "?"
                }
                let codePoint = UInt16(glyphMap[iconCode]!)
                
                return String(UnicodeScalar(codePoint)!)
            } catch {
                print("error:\(error)")
            }
        }
        
        return "?"
    }
    
    class func createAndSaveImage(for iconName: String, font: Font, size: CGFloat, color: UIColor, filePath: String) -> Bool {
        guard !FileManager.default.fileExists(atPath: filePath) else {
            return true
        }
        
        var fontSize = size
        if (UIScreen.main.nativeScale == 2.0) {
            fontSize = size * 1.58
        }
        let attributedString = NSAttributedString(iconName: iconName, color: color, size: fontSize)
        let stringSize = attributedString.size()
        UIGraphicsBeginImageContextWithOptions(stringSize, false, 0)
        attributedString.draw(in: CGRect(x: 0, y: (stringSize.height - fontSize) * 0.5, width: stringSize.width, height: fontSize))
        
        let iconImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()
        
        return (iconImage!.pngData()! as NSData).write(toFile: filePath, atomically: true)
    }
}
