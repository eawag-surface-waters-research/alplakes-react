//
//  CustomMenu.swift
//  Median
//
//  Created by Kevz on 2/4/25.
//  Copyright © 2024 GoNative.io LLC. All rights reserved.

import Foundation
import UIKit

@objc public class CustomMenu: UIView, UIGestureRecognizerDelegate {
    private var onTap: (([String: String]?) -> Void)?
    private var menuView: UIView?
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }
    
    @objc public init(container: UIView, button: UIButton, data: [[String: String]], onTap: (([String: String]?) -> Void)?) {
        super.init(frame: CGRect())
        self.onTap = onTap
        
        container.addSubview(self)
        
        setUpView(container: container)
        createMenu(button: button, data: data)
        show()
    }
    
    private func setUpView(container: UIView) {
        self.backgroundColor = .red
        translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            trailingAnchor.constraint(equalTo: container.trailingAnchor),
            leadingAnchor.constraint(equalTo: container.leadingAnchor),
            topAnchor.constraint(equalTo: container.topAnchor),
            bottomAnchor.constraint(equalTo: container.bottomAnchor),
        ])
        
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap(sender:)))
        addGestureRecognizer(tapGesture)
        let panGesture = UIPanGestureRecognizer(target: self, action: #selector(handlePan(sender:)))
        addGestureRecognizer(panGesture)
    }
    
    private func createMenu(button: UIButton, data: [[String: String]]) {
        var menus: [CustomMenuItem] = []
        
        for (index, item) in data.enumerated() {
            let menuItem = CustomMenuItem(data: item) {
                self.hide(item)
            }
            
            if index < data.count {
                menuItem.addBottomBorder()
            }
            
            menus.append(menuItem)
        }
        
        let stackView = UIStackView(arrangedSubviews: menus)
        stackView.axis = .vertical
        stackView.spacing = 0
        stackView.layer.cornerRadius = 15
        stackView.backgroundColor = .secondarySystemBackground
        stackView.clipsToBounds = true
        
        stackView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.trailingAnchor.constraint(equalTo: button.trailingAnchor, constant: 6),
            stackView.topAnchor.constraint(equalTo: button.bottomAnchor, constant: 10),
        ])
        
        menuView = stackView
    }
    
    private func show() {
        guard let menuView = menuView else {
            return
        }
        menuView.transform = CGAffineTransform(scaleX: 0.8, y: 0.8)
        backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0)
        
        UIView.animate(withDuration: 0.1) {
            menuView.transform = .identity
            self.backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.2)
        }
    }
    
    private func hide(_ response: [String : String]?) {
        self.removeFromSuperview()
        self.onTap?(response)
    }
    
    @objc private func handleTap(sender: UITapGestureRecognizer) {
        hide(nil)
    }
    
    @objc private func handlePan(sender: UIPanGestureRecognizer) {
        if sender.state == .ended {
            hide(nil)
        }
    }
    
    @objc public func setMenuColor(_ color: UIColor) {
        menuView?.backgroundColor = color
    }
}

class CustomMenuItem: UIView {
    private var data: [String : String]?
    private var onTap: (() -> Void)?
    
    private var label: UILabel?
    private var imageView: UIImageView?
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        initialize()
    }
    
    init(data: [String: String], onTap: (() -> Void)?) {
        super.init(frame: .zero)
        self.data = data
        self.onTap = onTap
        initialize()
    }
    
    private func initialize() {
        backgroundColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0)
        
        isAccessibilityElement = true
        accessibilityLabel = data?["label"] ?? ""
        
        let label = createLabel()
        addSubview(label)
        label.isAccessibilityElement = false
        label.translatesAutoresizingMaskIntoConstraints = false
        
        if let imageView = createImageView() {
            addSubview(imageView)
            imageView.translatesAutoresizingMaskIntoConstraints = false
            
            NSLayoutConstraint.activate([
                imageView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
                imageView.centerYAnchor.constraint(equalTo: centerYAnchor),
                imageView.heightAnchor.constraint(equalToConstant: 20),
                imageView.widthAnchor.constraint(equalToConstant: 20),
                imageView.trailingAnchor.constraint(equalTo: label.leadingAnchor, constant: -12)
            ])
            
            self.imageView = imageView
        } else {
            NSLayoutConstraint.activate([
                label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16)
            ])
        }
        
        NSLayoutConstraint.activate([
            label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
            label.centerYAnchor.constraint(equalTo: centerYAnchor),
            label.widthAnchor.constraint(equalToConstant: 195),
            heightAnchor.constraint(equalToConstant: 44)
        ])
        
        self.label = label
        
        let longPressGesture = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress(_:)))
        longPressGesture.minimumPressDuration = 0
        addGestureRecognizer(longPressGesture)
    }
    
    func createImageView() -> UIImageView? {
        guard let iconName = data?["icon"] as? String else {
            return nil
        }
        
        let image = LEANIcons.imageForIconIdentifier(iconName, size: 20, color: UIColor(named: "titleColor") ?? .label)
        let imageView = UIImageView(image: image)
        imageView.contentMode = .scaleAspectFit
        imageView.tintColor = .label
        return imageView
    }
    
    func createLabel() -> UILabel {
        let label = UILabel()
        label.text = data?["label"] ?? ""
        label.textAlignment = .left
        label.font = UIFont.systemFont(ofSize: 16)
        label.textColor = UIColor(named: "titleColor") ?? .label
        return label
    }
    
    func addBottomBorder() {
        let borderLayer = CALayer()
        borderLayer.backgroundColor = UIColor.separator.cgColor
        borderLayer.frame = CGRect(x: 0, y: frame.size.height - 1, width: 260, height: 1)
        layer.addSublayer(borderLayer)
    }
    
    @objc private func handleLongPress(_ gesture: UILongPressGestureRecognizer) {
        if gesture.state == .began || (gesture.state == .changed && gestureInsideView(gesture)) {
            label?.layer.opacity = 0.3
            imageView?.layer.opacity = 0.3
        } else {
            label?.layer.opacity = 1
            imageView?.layer.opacity = 1
            
            if gesture.state == .ended && gestureInsideView(gesture) {
                onTap?()
            }
        }
    }
    
    func gestureInsideView(_ gesture: UILongPressGestureRecognizer) -> Bool {
        let touchLocation = gesture.location(in: self)
        return self.bounds.contains(touchLocation)
    }
}
