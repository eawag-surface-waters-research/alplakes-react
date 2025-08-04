//
//  FontFactory.swift
//  MedianIcons
//
//  Created by Hunaid Hassan on 17.04.22.
//

import Foundation

class FontFactory {
    class func font(for iconName: String) -> Font? {
        if iconName.hasPrefix("custom") {
            return .customFont
        } else if iconName.hasPrefix("fas") {
            return .fontAwesome6Solid
        } else if iconName.hasPrefix("fab") {
            return .fontAwesome6Brands
        } else if iconName.hasPrefix("far") {
            return .fontAwesome6Regular
        } else if iconName.hasPrefix("fal") {
            return .fontAwesome6Light
        } else if iconName.hasPrefix("fat") {
            return .fontAwesome6Thin
        } else if iconName.hasPrefix("md") {
            return .materialDesign
        }
        
        return nil
    }
}
