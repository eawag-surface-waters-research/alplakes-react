//
//  NSAttributedString+Font.swift
//  MedianIcons
//
//  Created by Hunaid Hassan on 30.04.22.
//

import Foundation

extension NSAttributedString {
    @objc convenience public init(iconName: String, color: UIColor, size: CGFloat) {
        guard let iconFont = FontFactory.font(for: iconName) else {
            self.init()
            return
        }
        
        let glyph = Utilities.glyphFromIconName(iconName, font: iconFont)
        let uiFont = iconFont.uiFont(size: size)
        
        self.init(string: glyph, attributes: [NSAttributedString.Key.foregroundColor: color, NSAttributedString.Key.font: uiFont])
    }
}
