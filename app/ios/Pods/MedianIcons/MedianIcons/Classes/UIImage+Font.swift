//
//  UIImage+Font.swift
//  MedianIcons
//
//  Created by Hunaid Hassan on 17.04.22.
//

import Foundation

extension UIImage {
    public convenience init(iconName: String, size: CGFloat, color: UIColor) {
        let iconFont = FontFactory.font(for: iconName)
        guard let iconFont = iconFont else {
            self.init()
            
            return
        }
        
        let filePath = Utilities.generateFilePath(for: iconName, fontName: iconFont.fontName, fontSize: size, color: color)
        
        let succeeded = Utilities.createAndSaveImage(for: iconName, font: iconFont, size: size, color: color, filePath: filePath)
        
        if (succeeded) {
            let data = try? Data(contentsOf: URL(fileURLWithPath: filePath))
            self.init(data: data!, scale: 3.0)!
            return
        }
        
        self.init()
    }
}
