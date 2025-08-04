//
//  Font.swift
//  MedianIcons
//
//  Created by Hunaid Hassan on 17.04.22.
//

import Foundation

struct Font {
    let fontName: String
    let fontFamilyName: String
    let glyphMapFile: String
    var bundle = Bundle(for: FontLoader.self)
    
    static var customFont: Font {
        get {
            return Font(fontName: "custom-icons.ttf", fontFamilyName: "custom-icons", glyphMapFile: "custom-icons", bundle: Bundle.main)
        }
    }
    
    static var fontAwesome6Solid: Font {
        get {
            return Font(fontName: "FontAwesome6_Solid.ttf", fontFamilyName: "FontAwesome6Pro-Solid", glyphMapFile: "FontAwesome")
        }
    }
    
    static var fontAwesome6Brands: Font {
        get {
            return Font(fontName: "FontAwesome6_Brands.ttf", fontFamilyName: "FontAwesome6Brands-Regular", glyphMapFile: "FontAwesome")
        }
    }
    
    static var fontAwesome6Regular: Font {
        get {
            return Font(fontName: "FontAwesome6_Regular.ttf", fontFamilyName: "FontAwesome6Pro-Regular", glyphMapFile: "FontAwesome")
        }
    }
    
    static var fontAwesome6Light: Font {
        get {
            return Font(fontName: "FontAwesome6_Light.ttf", fontFamilyName: "FontAwesome6Pro-Light", glyphMapFile: "FontAwesome")
        }
    }
    
    static var fontAwesome6Thin: Font {
        get {
            return Font(fontName: "FontAwesome6_Thin.ttf", fontFamilyName: "FontAwesome6Pro-Thin", glyphMapFile: "FontAwesome")
        }
    }
  
    static var materialDesign: Font {
        get {
            return Font(fontName: "MaterialDesign.ttf", fontFamilyName: "MaterialIcons-Regular", glyphMapFile: "MaterialDesign")
        }
    }
    
    func uiFont(size: CGFloat) -> UIFont {
        var uiFont = UIFont(name: fontFamilyName, size: size)
        if (uiFont == nil) {
            FontLoader.loadFont(fontName, fromBundle: bundle)
            uiFont = UIFont(name: fontFamilyName, size: size)
        }
        
        return uiFont!
    }
}
